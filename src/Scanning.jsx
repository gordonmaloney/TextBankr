import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { BtnStyle } from "./MUIShared";

// UTF-8 safe base64 decode helper
const decodeBundle = (str) => {
  try {
    if (str.startsWith("TX1:")) {
      const b64 = str.slice(4).trim();
      const json = atob(b64);
      const parsed = JSON.parse(decodeURIComponent(escape(json)));
      if (parsed && parsed.v === 1 && Array.isArray(parsed.chunks))
        return parsed.chunks;
    }
    return null;
  } catch (e) {
    return null;
  }
};

const tryParseSingle = (text) => {
  // Accept raw JSON chunk or URL with ?data=
  try {
    if (text.startsWith("http")) {
      const url = new URL(text);
      const dataParam = url.searchParams.get("data");
      if (!dataParam) return null;
      return JSON.parse(decodeURIComponent(dataParam));
    }
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

const Scanning = ({
  Translation,
  isMobile,
  rowData,
  setRowData,
  setNoAnswerMessage,
  setFollowUpMessage,
  setExtensionCode,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState("");

  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [errorSnack, setErrorSnack] = useState("");

  //check if url has /paste
  const [hasPaste, setHasPaste] = useState(false);
  useEffect(() => {
    const currentUrl = window.location.href;
    if (currentUrl.includes("paste")) {
      setHasPaste(true);
    }
  }, []);

  //if redirected from camera scan, set is scanning to true right away
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");

    if (dataParam) {
      setIsScanning(true);
    }
  }, []);

  const scrollToLinks = () => {
    document
      .getElementById("generatedLinks")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (scanProgress === Translation.scanSuccess) {
      scrollToLinks();
    }
  }, [scanProgress]);

  const reconstructAndSet = (scannedChunks) => {
    // Reconstruct Data
    const reconstructedTemplates = {};
    const reconstructedContacts = [];

    scannedChunks
      .sort((a, b) => a.partIndex - b.partIndex)
      .forEach((chunk) => {
        if (chunk.key) {
          reconstructedTemplates[chunk.key] =
            (reconstructedTemplates[chunk.key] || "") + chunk.data;
        } else if (Array.isArray(chunk.data)) {
          reconstructedContacts.push(...chunk.data);
        }
      });

    // Update State
    setRowData(reconstructedContacts);
    setNoAnswerMessage(reconstructedTemplates.noAnswer || "");
    setFollowUpMessage(reconstructedTemplates.followUp || "");
    if (scannedChunks[0]?.extensionCode)
      setExtensionCode(scannedChunks[0].extensionCode);

    setScanProgress(Translation.scanSuccess);
    setPasteOpen(false);
    setPasteValue("");
  };

  // Handle paste code processing
  const handlePasteProcess = () => {
    const text = pasteValue.trim();
    if (!text) return;

    // 1) Try bundle format TX1:<base64>
    const bundleChunks = decodeBundle(text);
    if (bundleChunks) {
      reconstructAndSet(bundleChunks);
      return;
    }

    // 2) Try multi-line of items (each line can be URL-with-data or JSON)
    if (text.includes("\n")) {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      const chunks = [];
      for (const line of lines) {
        const parsed = tryParseSingle(line);
        if (parsed && typeof parsed.partIndex === "number") {
          chunks.push(parsed);
        }
      }
      if (chunks.length) {
        reconstructAndSet(chunks);
        return;
      }
    }

    // 3) Try a single item (URL or JSON)
    const single = tryParseSingle(text);
    if (single) {
      reconstructAndSet([single]);
      return;
    }

    setErrorSnack(Translation.scanInvalid || "Invalid code");
  };

  useEffect(() => {
    if (!isScanning) return;

    const scannedChunks = [];
    let totalChunks = 0;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 25,
      qrbox: 800,
    });

    scanner.render(
      (decodedText) => {
        try {
          let chunk;

          if (decodedText.startsWith("http")) {
            const url = new URL(decodedText);
            const dataParam = url.searchParams.get("data");

            if (dataParam) {
              try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                chunk = decodedData;
              } catch (err) {
                console.error("Failed to decode data:", err);
                setScanProgress(Translation.scanInvalid);
                return;
              }
            } else {
              setScanProgress(Translation.scanInvalid);
              return;
            }
          } else {
            try {
              chunk = JSON.parse(decodedText);
            } catch (err) {
              setScanProgress(Translation.scanInvalid);
              return;
            }
          }

          // Add unique chunks only
          if (!scannedChunks.some((c) => c.partIndex === chunk.partIndex)) {
            scannedChunks.push(chunk);
            if (!totalChunks) totalChunks = chunk.totalParts;
            setScanProgress(
              `${Translation.scanXofY} ${scannedChunks.length} / ${totalChunks}.`
            );
          }

          if (scannedChunks.length === totalChunks) {
            scanner.clear();
            setIsScanning(false);
            reconstructAndSet(scannedChunks);
          }
        } catch {
          setScanProgress(Translation.scanInvalid);
        }
      },
      (error) => {
        console.error(Translation.scanError, error);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error(Translation.scanError, err));
    };
  }, [
    isScanning,
    setRowData,
    setNoAnswerMessage,
    setFollowUpMessage,
    setExtensionCode,
  ]);

  return (
    <div>
      {isScanning && (
        <div>
          <div id="reader" style={{ width: "100%", marginTop: "20px" }}></div>
          <p>{scanProgress}</p>
        </div>
      )}

      {/* Scan QR Code from Desktop Button */}
      {isMobile && (
        <center>
          <Button
            onClick={() => setIsScanning(true)}
            variant="contained"
            style={{ backgroundColor: "#28a745", marginBottom: "14px" }}
          >
            {Translation.scanBtn}{" "}
          </Button>
        </center>
      )}

      {/* Paste Code */}
      {hasPaste && (
        <center>
          <Button
            onClick={() => setPasteOpen(true)}
            variant="outlined"
            style={{ ...BtnStyle, marginBottom: '10px' }}
          >
            {Translation.pasteCodeBtn || "Paste code"}
          </Button>
        </center>
      )}

      <Dialog
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {Translation.pasteCodeTitle || "Paste transfer code"}
        </DialogTitle>
        <DialogContent>
          <TextField
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            multiline
            minRows={6}
            fullWidth
            placeholder={
              Translation.pasteCodePlaceholder || "Paste the code here..."
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasteOpen(false)}>
            {Translation.cancel || "Cancel"}
          </Button>
          <Button variant="contained" onClick={handlePasteProcess}>
            {Translation.processCode || "Process"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(errorSnack)}
        autoHideDuration={2500}
        onClose={() => setErrorSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          {errorSnack}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Scanning;
