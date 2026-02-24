import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../contexts/OnboardingContext";

export function WelcomePage() {
  const navigate = useNavigate();
  const { completeStep } = useOnboarding();

  const handleStart = () => {
    completeStep(1);
    navigate("/onboarding/metodos-pago");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f7fa",
      padding: "40px"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "#e8f0fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 30px",
          fontSize: "50px"
        }}>
          🚀
        </div>

        {/* Título */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ 
            fontSize: "12px", 
            color: "#666",
            marginBottom: "10px",
            fontWeight: 600,
            letterSpacing: "1px"
          }}>
            PAGO NUBE
          </p>
          <h1 style={{
            fontSize: "36px",
            color: "#1a1a1a",
            marginBottom: "15px",
            fontWeight: "bold"
          }}>
            ¡Bienvenido a Pago Nube!
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.6"
          }}>
            Vamos configurar tu cuenta en pocos pasos. Todo lo que necesitas para empezar a recibir pagos está aquí.
          </p>
        </div>

        {/* Cards de Benefícios */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          margin: "30px 0"
        }}>
          {[
            { icon: "✅", title: "Configuração rápida", desc: "Configure em menos de 5 minutos" },
            { icon: "💳", title: "Múltiplos métodos", desc: "Aceite cartão, transferência e mais" },
            { icon: "🚀", title: "Comece a vender", desc: "Ative e comece a receber hoje mesmo" }
          ].map((benefit, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              textAlign: "left"
            }}>
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flexShrink: 0
              }}>
                {benefit.icon}
              </div>
              <div>
                <p style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginBottom: "5px",
                  color: "#1a1a1a"
                }}>
                  {benefit.title}
                </p>
                <p style={{
                  fontSize: "14px",
                  color: "#666"
                }}>
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botão CTA */}
        <button
          onClick={handleStart}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#0059d5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "20px"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0047ab"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#0059d5"}
        >
          Comenzar configuración
        </button>
        
        <p style={{
          marginTop: "15px",
          fontSize: "14px",
          color: "#999"
        }}>
          Tiempo estimado: 5 minutos
        </p>
      </div>
    </div>
  );
}
