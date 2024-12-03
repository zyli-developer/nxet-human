import { useEffect, useRef, useState } from "react";
// import { useNavigate } from 'react-router-dom';
import styles from "./index.module.scss";

const VALID_CODE = "123456";

const Invitation = () => {
  const [code, setCode] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const inputRefs = useRef(Array(6).fill(null));
  // const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setError("");

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d*$/.test(pastedData)) return;
    setError("");

    const newCode = [...code];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex((c) => !c);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = () => {
    const enteredCode = code.join("");
    if (enteredCode === VALID_CODE) {
      sessionStorage.setItem("isAuthenticated", "true");
      // window.location.replace("/human");
      window.location.replace("/next");
    } else {
      setError("验证码错误，请重新输入");
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  useEffect(()=>{ inputRefs.current[0]?.focus();},[])

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>邀请码</h1>
        <p className={styles.subtitle}>请输入您的六位数邀请码</p>

        <div className={styles.inputContainer}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              // type="number"
              maxLength='1'
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={styles.input}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.button}
          disabled={!code.every((digit) => digit)}
          onClick={handleSubmit}
        >
          确认
        </button>
      </div>
    </div>
  );
};

export default Invitation;
