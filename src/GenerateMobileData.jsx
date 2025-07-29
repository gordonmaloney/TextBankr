import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button, TextField } from "@mui/material";
import { BtnStyleSmall } from "./MUIShared";
import Grid from "@mui/material/Grid2";
import CloseIcon from "@mui/icons-material/Close";
import illustration from "./imgs/illustration.png";

const GenerateMobileData = ({
  Translation,

  rowData,
  isMobile,
  followUpMessage,
  noAnswerMessage,
  extensionCode,
}) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [currentQrIndex, setCurrentQrIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numBatches, setNumBatches] = useState(1);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [batchQrData, setBatchQrData] = useState([]); // Stores QR codes per batch

  const [Zoom, setZoom] = useState(false);

  const [hosting, setHosting] = useState(false);

  const [rotateSpeed, setRotateSpeed] = useState(1000);

  const generateMobileData = async () => {
    if (numBatches < 1) return;

    const maxChunkSize = 800;
    const templateMessages = {
      noAnswer: noAnswerMessage,
      followUp: followUpMessage,
    };

    // Split contacts into batches
    const batchSize = Math.ceil(rowData.length / numBatches);
    const batches = Array.from({ length: numBatches }, (_, i) =>
      rowData.slice(i * batchSize, (i + 1) * batchSize)
    );

    const batchQrCodes = [];

    for (const batch of batches) {
      const dataChunks = [];
      const qrChunks = [];

      // Step 1: Add template messages to chunks
      for (const [key, message] of Object.entries(templateMessages)) {
        let messageIndex = 0;
        let currentMessageChunk = "";
        let currentSize = 0;

        while (messageIndex < message.length) {
          const nextPart = message[messageIndex];
          const nextSize = new Blob([JSON.stringify(nextPart)]).size;

          if (currentSize + nextSize > maxChunkSize) {
            // Save the current chunk if it exceeds maxChunkSize
            dataChunks.push({
              key,
              partIndex: dataChunks.length + 1,
              totalParts: 0, // Placeholder
              data: currentMessageChunk,
              extensionCode,
            });

            // Start a new chunk
            currentMessageChunk = "";
            currentSize = 0;
          }

          // Add the part to the current chunk
          currentMessageChunk += nextPart;
          currentSize += nextSize;
          messageIndex++;
        }

        // Save the last chunk if it has any data
        if (currentMessageChunk.length > 0) {
          dataChunks.push({
            key,
            partIndex: dataChunks.length + 1,
            totalParts: 0, // Placeholder
            data: currentMessageChunk,
            extensionCode,
          });
        }
      }

      // Step 2: Add contacts to chunks
      const estimatedContactSize = JSON.stringify(batch[0] || {}).length + 50;
      const contactsPerChunk = Math.floor(maxChunkSize / estimatedContactSize);

      for (let i = 0; i < batch.length; i += contactsPerChunk) {
        const chunk = {
          partIndex: dataChunks.length + 1,
          totalParts: 0, // Placeholder
          data: batch.slice(i, i + contactsPerChunk),
          extensionCode,
        };
        dataChunks.push(chunk);
      }

      // Step 3: Set totalParts for all chunks
      const totalParts = dataChunks.length;
      dataChunks.forEach((chunk, index) => {
        chunk.totalParts = totalParts;
        chunk.partIndex = index + 1;
      });

      // Step 4: Generate QR codes
      for (const chunk of dataChunks) {
        try {
          //CHANGE QRCODEURL
          const encodedData = encodeURIComponent(JSON.stringify(chunk));
          const qrCodeUrl = await QRCode.toDataURL(
            `${window.location.origin}/start?data=${encodedData}`,
            {
              errorCorrectionLevel: "H",
              width: 600,
            }
          );

          /*		
					//UNCHANGED QRCODEURL THING
					const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(chunk), {
						errorCorrectionLevel: "H",
						width: 600,
					});
*/

          qrChunks.push(qrCodeUrl);
        } catch (error) {
          console.error("Error generating QR code:", error);
          return;
        }
      }

      batchQrCodes.push(qrChunks);
    }

    console.log("Batch QR Codes:", batchQrCodes);

    setBatchQrData(batchQrCodes);
    setCurrentBatchIndex(0);
    setQrCodes(batchQrCodes[0]);
  };

  useEffect(() => {
    generateMobileData();
  }, [numBatches]);

  useEffect(() => {
    if (!Zoom) {
      if (qrCodes.length > 0) {
        const interval = setInterval(() => {
          setCurrentQrIndex((prevIndex) => (prevIndex + 1) % qrCodes.length);
        }, rotateSpeed);
        return () => clearInterval(interval);
      }
    }
  }, [Zoom, qrCodes, rotateSpeed]);

  const nextQRCode = () => {
    setCurrentQrIndex((prevIndex) => (prevIndex + 1) % qrCodes.length);
  };
  const prevQRCode = () => {
    setCurrentQrIndex(
      (prevIndex) => (prevIndex - 1 + qrCodes.length) % qrCodes.length
    );
  };

  const nextBatch = () => {
    if (currentBatchIndex < batchQrData.length - 1) {
      setCurrentBatchIndex(currentBatchIndex + 1);
      setQrCodes(batchQrData[currentBatchIndex + 1]);
      setCurrentQrIndex(0);
    }
  };

  const prevBatch = () => {
    if (currentBatchIndex > 0) {
      setCurrentBatchIndex(currentBatchIndex - 1);
      setQrCodes(batchQrData[currentBatchIndex - 1]);
      setCurrentQrIndex(0);
    }
  };

  const baseURL = window.location.host;

  const handleHosting = () => {
    if (!hosting) {
      setHosting(true);
    } else {
      setNumBatches(1);
      setHosting(false);
    }
  };

  const openModal = () => {
    generateMobileData();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setHosting(false);
    setZoom(false);
  };

  const openHostModal = () => {
    setHosting(true);
    generateMobileData();
    setIsModalOpen(true);
  };

  const handleRemote = () => {
    setZoom(true);
  };

  return (
    <>
      {!isMobile && (
        <>
          <Button
            variant="contained"
            sx={BtnStyleSmall}
            onClick={() => openModal()}
            disabled={rowData.length === 0}
          >
            Send from mobile
          </Button>

          <Button
            variant="contained"
            sx={{ ...BtnStyleSmall, marginLeft: isMobile ? 0 : "20px" }}
            onClick={() => openHostModal()}
            disabled={rowData.length === 0}
          >
            Host a session
          </Button>
        </>
      )}

      {isModalOpen && (
        <div
          onClick={() => closeModal()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              width: "90%",
              maxWidth: "1000px",
              height: Zoom && "95%",
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{
                height: hosting && numBatches > 1 ? "600px" : "550px",
              }}
            >
              <Grid
                size={{ xs: 4, lg: 6 }}
                style={{
                  height: "100%",
                  display: Zoom ? "none" : "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
                justifyContent={"space-between"}
              >
                <div>
                  <CloseIcon
                    style={{ float: "left", cursor: "pointer" }}
                    onClick={() => closeModal()}
                  />

                  <h2 style={{ marginBottom: "12px", marginTop: "12px" }}>
                    Scan from your mobile
                  </h2>
                </div>
                <p
                  style={{
                    textAlign: "left",
                    padding: "0 20px",
                    marginTop: 0,
                    zIndex: 5,
                    display: !hosting ? "block" : "none",
                    position: "relative",
                  }}
                >
                  <center>
                    {" "}
                    To send your messages from your phone, simply open{" "}
                    <u>{baseURL}/start</u> from your mobile, hit "Scan from
                    desktop" and scan the QR code
                    {qrCodes.length > 1 && <>s</>} to the right.
                  </center>
                </p>
                {hosting && (
                  <>
                    <p
                      style={{
                        textAlign: "left",
                        padding: "0 20px",
                        marginTop: 0,
                        marginBottom: 0,
                        zIndex: 5,
                        display: "block",
                        position: "relative",
                      }}
                    >
                      If you are hosting a phone- or text-banking session, you
                      can divvy up the contacts between attendees. Just say how
                      many people you want to split it up by, and each user will
                      get a set of QR codes with the template message(s) and
                      their portion of the contacts.
                    </p>

                    <div>
                      <Grid
                        container
                        style={{
                          padding: "0 20px",
                          //minWidth: "250px",
                          margin: "10px auto",
                          position: "relative",
                          zIndex: "2",
                        }}
                        justifyContent={"space-around"}
                        alignItems={"center"}
                      >
                        <Grid size={{ xs: 8, lg: 6 }}>
                          <h4 style={{ textAlign: "left", margin: "0" }}>
                            How many people are you splitting between?
                          </h4>
                        </Grid>{" "}
                        <Grid size={{ xs: 4, lg: 6 }}>
                          <TextField
                            type="number"
                            value={numBatches}
                            onChange={(e) =>
                              setNumBatches(
                                Math.max(1, parseInt(e.target.value, 10) || 1)
                              )
                            }
                            sx={{
                              width: { sm: "60px", lg: "120px" },
                              marginRight: "10px",
                              position: "relative",
                              zIndex: "2",
                            }}
                          />
                        </Grid>
                      </Grid>
                      {numBatches > 1 && (
                        <div>
                          <p style={{ textAlign: "left", padding: "0 20px" }}>
                            Once each person has scanned, you can use the
                            buttons to to the right generate the QR codes for
                            the next user.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <img
                  src={illustration}
                  style={{ width: "90%", margin: "0 auto" }}
                />
              </Grid>
              <Grid
                size={{ xs: 8, lg: 6 }}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
                justifyContent={"space-between"}
              >
                {hosting && numBatches > 1 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: Zoom ? "30%" : "80%",
                      margin: "0 auto",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        ...BtnStyleSmall,
                        position: "relative",
                        zIndex: "2",
                        marginRight: "5px",
                      }}
                      onClick={prevBatch}
                      disabled={currentBatchIndex === 0}
                    >
                      Previous
                    </Button>

                    <h3
                      style={{
                        margin: 0,
                        display: "block",
                        position: "relative",
                        zIndex: "2",
                        marginBottom: "5px",
                      }}
                    >
                      User {currentBatchIndex + 1}
                    </h3>
                    <Button
                      variant="contained"
                      sx={{
                        ...BtnStyleSmall,
                        position: "relative",
                        zIndex: "2",
                        marginLeft: "5px",
                      }}
                      onClick={nextBatch}
                      disabled={currentBatchIndex === batchQrData.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}

                <div>
                  <img
                    src={qrCodes[currentQrIndex]}
                    alt="QR Code"
                    style={{
                      maxWidth: Zoom ? "100%" : "500px",
                      width: "80%",
                      //height: "auto",
                      position: "relative",
                      zIndex: 1,
                      margin: "-10px auto",
                    }}
                  />

                  {!Zoom && (
                    <span
                      style={{
                        display: "block",
                        position: "relative",
                        zIndex: 5,
                      }}
                    >
                      QR Code {currentQrIndex + 1} of {qrCodes.length}
                    </span>
                  )}
                </div>

                {Zoom && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "30%",
                      margin: "0 auto",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        ...BtnStyleSmall,
                        width: "auto",
                        margin: "10px auto 0 auto",
                      }}
                      onClick={() => prevQRCode()}
                    >
                      Prev
                    </Button>

                    <span
                      style={{
                        display: "block",
                        position: "relative",
                        zIndex: 5,
                      }}
                    >
                      QR Code {currentQrIndex + 1} of {qrCodes.length}
                    </span>
                    <Button
                      variant="contained"
                      sx={{
                        ...BtnStyleSmall,
                        width: "auto",
                        margin: "10px auto 0 auto",
                      }}
                      onClick={() => nextQRCode()}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {!Zoom && (
                  <div
                    style={{
                      width: "80%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "space-around",
                      margin: "0 auto",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        ...BtnStyleSmall,
                        width: "auto",
                        margin: "10px auto 0 auto",
                      }}
                      onClick={() => setRotateSpeed(rotateSpeed + 200)}
                    >
                      Slow speed
                    </Button>

                    {hosting && !Zoom && (
                      <Button
                        variant="contained"
                        sx={{
                          ...BtnStyleSmall,
                          width: "auto",
                          margin: "10px auto 0 auto",
                        }}
                        onClick={() => handleRemote()}
                      >
                        Remote
                      </Button>
                    )}
                  </div>
                )}
              </Grid>
            </Grid>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateMobileData;
