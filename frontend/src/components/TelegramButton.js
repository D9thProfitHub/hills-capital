import React from "react";

function TelegramButton() {
  const handleClick = () => {
    // Replace with your actual Telegram link
    window.open("https://t.me/YourTelegramUsername", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: "#0088cc",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      Join us on Telegram
    </button>
  );
}

export default TelegramButton;