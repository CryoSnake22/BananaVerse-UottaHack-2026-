import {useState} from "react";
import "../css/PersonalInfoCard.css";

function PersonalInfoCard({ backgroundImage }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleDownload = async () => {
    const response = await fetch(backgroundImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "background-image.png";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    const result = validateForm({
        name,
        email,
        phone,
    });

    if (!result.valid) {
        alert(result.message);
        return;
    }

    setSubmitted(true);
  }

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 10);

    if (digits.length <= 3) return part1;
    if (digits.length <= 6) return `(${part1}) ${part2}`;
    return `(${part1}) ${part2}-${part3}`;
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    setPhone(formatPhoneNumber(numericValue));
  };

  const validateForm = ({ name, email, phone }) => {
    // Trim inputs
    if (!name.trim() || !email.trim() || !phone.trim()) {
        return { valid: false, message: "All fields are required." };
    }

    // Email regex
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { valid: false, message: "Invalid email address." };
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(digitsOnly)) {
      return { valid: false, message: "Invalid phone number." };
    }

    return { valid: true };
  };

  return (
    <div
      className={`personal-info-wrapper ${submitted ? "revealed" : ""}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
        <div className="download-btn">
            <button onClick={handleDownload}>
                Download Image
            </button>
        </div>

      {/* Blur overlay */}
      {!submitted && <div className="blur-overlay" />}

      {/* Card */}
      {!submitted && (
        <div className="personal-info-card">
          <h2> Almost done! </h2>

          <div className="input-group">
            <label>Name</label>
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input type="tel" placeholder="(123) 456-7890" value={phone} onChange={handlePhoneChange} maxLength={14} />
          </div>

          <button onClick={() => handleSubmit()}>
            See your BananaScape
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonalInfoCard