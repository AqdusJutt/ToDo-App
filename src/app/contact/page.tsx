"use client";

import { useState } from "react";
import styles from "./ContactPage.module.css";
import { sendContactEmail } from "./actions";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setStatus("");

    const result = await sendContactEmail(formData);

    if ((result as any)?.success) {
      setStatus("Message sent successfully! We will get back to you soon.");
    } else {
      setStatus(`Error: ${(result as any)?.error || "Failed to send."}`);
    }

    setIsSubmitting(false);
  };

  return (
    <main className={styles.mainBackground}>
      <div className={styles.container}>
        <div className={styles.infoPanel}>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <span className={styles.icon}>📍</span>
              <div>
                <h4>Location</h4>
                <p>4th Floor Gulberg Emporium, Business Square, Block A Gulberg Greens Islamabad, Islamabad Capital Territory 44000.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.icon}>📞</span>
              <div>
                <h4>Phone</h4>
                <p>+92 006982714</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.icon}>🕒</span>
              <div>
                <h4>Hours</h4>
                <p>10 am to 4 pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <h2>Contact Form</h2>
          <form action={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" name="fullName" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Comment or message</label>
              <textarea id="message" name="message" rows={4} required></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
            {status && <p className={styles.statusMessage}>{status}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}
