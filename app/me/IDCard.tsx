"use client";
import React, { useState } from "react";
import QrCodeGenerator from "./QRCode";
import BarcodeGenerator from "./BarCode";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Alert } from "@/components/home/alert";

const IDCard = ({
  EJG_code,
  codeType,
}: {
  EJG_code: string;
  codeType?: "qr" | "barcode" | "both";
}) => {
  const [showQr, setShowQr] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  const handleGenerate = () => {
    if (codeType !== "barcode") setShowQr(!showQr);
    if (codeType !== "qr") setShowBarcode(!showBarcode);
  };

  if (["null", "undefined", ""].includes(EJG_code)) return <></>;

  return (
    <>
      <button
        onClick={handleGenerate}
        className="relative box-border inline-flex h-6 min-w-min max-w-fit items-center justify-between whitespace-nowrap rounded-full bg-selfprimary-100 px-1 text-tiny text-foreground-800"
      >
        <span className="flex-1 px-1 pl-0.5 font-normal text-inherit">
          {(() => {
            if (codeType === "both") return "QR kód és vonalkód megjelenítése";
            if (codeType === "qr") return "QR kód megjelenítése";
            return "Vonalkód megjelenítése";
          })()}
        </span>
      </button>

      <Modal
        isOpen={showQr || showBarcode}
        onClose={handleGenerate}
        size="sm"
        className="mx-5 overflow-auto bg-selfprimary-bg text-foreground"
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
            <Alert className="border-danger-400 bg-danger-100">
              Menzán és kiléptetéskor a kód nem használható, csak a kártya. (A
              lézeres vonalkódolvasók nem tudják beolvasni a kijelzőn található
              kódokat.)
            </Alert>
            {showQr && <QrCodeGenerator value={EJG_code} />}
            {showBarcode && <BarcodeGenerator value={EJG_code} />}
          </ModalBody>
          <ModalFooter>
            <Button className="bg-selfprimary-200" onPress={handleGenerate}>
              Bezárás
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default IDCard;
