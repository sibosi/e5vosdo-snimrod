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

const IDCard = ({ EJG_code }: { EJG_code: string }) => {
  const [showQr, setShowQr] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  const handleGenerate = () => {
    setShowQr(!showQr);
    setShowBarcode(!showBarcode);
  };

  return (
    <div className="p-4">
      <Button onClick={handleGenerate}>QR kód és vonalkód megjelenítése</Button>

      <Modal
        isOpen={showQr || showBarcode}
        onClose={handleGenerate}
        size="sm"
        className="mx-5 overflow-auto"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>QR kód és vonalkód</ModalHeader>
          <ModalBody>
            <p>Itt láthatod a QR kódot és a vonalkódot is.</p>
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
