"use client";

import { useEffect, useState } from "react";
import { Alert } from "./alert";
import { AlertType } from "@/db/dbreq";
import parse from "html-react-parser";

function getAlerts() {
  return fetch("/api/alerts").then((res) => res.json());
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertType[]>();

  useEffect(() => {
    getAlerts().then((data: AlertType[]) => {
      setAlerts(data);
    });
  }, []);

  if (
    alerts !== undefined &&
    alerts.length != 0 &&
    alerts[0].text.includes("redirect")
  )
    window.location.replace(alerts[0].text.split("=")[1]);

  if (!alerts) return;

  return alerts.map((alert, index) => (
    <Alert
      key={index}
      className={"whitespace-pre-line " + alert.className}
      icon={alert.icon}
      padding={alert.padding}
    >
      <span>{parse(alert.text)}</span>
    </Alert>
  ));
};

export default Alerts;
