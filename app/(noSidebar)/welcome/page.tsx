import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeFeatures from "@/components/welcome/WelcomeFeatures";
import WelcomeCTA from "@/components/welcome/WelcomeCTA";

export default function WelcomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-selfprimary-50 to-selfprimary-100">
      <WelcomeHero />
      <WelcomeFeatures />
      <WelcomeCTA />
    </div>
  );
}
