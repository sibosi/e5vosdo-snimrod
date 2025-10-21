import { getAuth } from "@/db/dbreq";
import PresentationList from "./presentationList";
import PleaseLogin from "../../me/redirectToLogin";
import { Card, CardBody } from "@heroui/react";
import { gate } from "@/db/permissions";

const PresentationSelectionPage = async () => {
  const selfUser = await getAuth();

  // Check if user is logged in
  if (!selfUser) return <PleaseLogin />;

  // Check if user is a teacher (teachers are not verified students)
  // or has organiser permission
  const isTeacher = gate(selfUser, "teacher", "boolean");

  if (!isTeacher) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="bg-warning-50">
          <CardBody>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-warning-800">
                Hozzáférés megtagadva
              </h2>
              <p className="text-warning-700">
                Ez az oldal csak tanárok és szervezők számára érhető el.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // User is authorized, show presentation list
  return <PresentationList />;
};

export default PresentationSelectionPage;
