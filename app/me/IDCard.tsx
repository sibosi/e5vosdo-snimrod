"use client";
import React, { useState } from "react";
import QrCodeGenerator from "./QRCode";
import BarcodeGenerator from "./BarCode";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

const IDCard = ({
  EJG_code,
  codeType,
  center,
}: {
  EJG_code: string;
  codeType?: "qr" | "barcode" | "both";
  center?: boolean;
}) => {
  const [showQr, setShowQr] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  const handleGenerate = () => {
    if (codeType !== "barcode") setShowQr(!showQr);
    if (codeType !== "qr") setShowBarcode(!showBarcode);
  };

  return (
    <div className={"flex max-w-min p-4 " + (center ? "mx-auto" : "")}>
      <Button onClick={handleGenerate} className="w-full">
        {codeType === "both"
          ? "QR kód és vonalkód"
          : codeType === "qr"
            ? "QR kód"
            : "Vonalkód"}{" "}
        megjelenítése
      </Button>

      <Modal
        isOpen={showQr || showBarcode}
        onClose={handleGenerate}
        size="sm"
        className="mx-5 overflow-auto"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {codeType === "both"
              ? "QR kód és vonalkód"
              : codeType === "qr"
                ? "QR kód"
                : "Vonalkód"}
          </ModalHeader>
          <ModalBody>
            <p>A kód az EJG azonosítód alapján készült.</p>
            {showQr && <QrCodeGenerator value={EJG_code} />}
            {showBarcode && <BarcodeGenerator value={EJG_code} />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleGenerate}>Bezárás</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default IDCard;
