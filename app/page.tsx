import { InfoCard } from "@/components/infocard";
import "@/styles/bgimage.css";

export default function Home() {
  return (
    <div>
      <InfoCard
        title="ZöldBiz"
        details="Ez egy befogadó közösség"
        image="/groups/zoldbiz.jpg"
      />

      <div className="hero bgimage">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
}
