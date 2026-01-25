import ConnexionForm from "./Login";
import bg from "../../assets/bg.png";

export default function AuthSwitcher() {
  return (
    <div
      className="w-full h-full min-h-screen"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen flex items-center justify-center  font-sans">
        <div className={`transition-all duration-700 ease-in-out `}>
          {/* --- Formulaires --- */}
          <div className={``}>
            <ConnexionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
