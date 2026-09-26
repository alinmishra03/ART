import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowRight } from "../../components/ui/icons";
import { copy, emailjsConfig, profile } from "../../content/profile";

type Field = "name" | "email" | "subject" | "message";
type Status = "idle" | "sending" | "sent" | "error";

// Labels and placeholders from the original form.
const FIELDS: { key: Field; label: string; placeholder: string; type?: string; required: boolean; multiline?: boolean; autoComplete?: string }[] = [
  { key: "name", label: "Full Name", placeholder: "John Doe", required: true, autoComplete: "name" },
  { key: "email", label: "Email Address", placeholder: "john@example.com", type: "email", required: true, autoComplete: "email" },
  { key: "subject", label: "Subject / Project Type", placeholder: "e.g. Website Redesign / SaaS Product", required: false },
  { key: "message", label: "How can I help you?", placeholder: "Tell me about your inquiry...", required: true, multiline: true },
];

const ERRORS: Record<Field, string> = {
  name: "Please enter your name.",
  email: "Please enter a valid email address.",
  subject: "",
  message: "Please add a short message.",
};

/**
 * EmailJS form. Same service, template and template parameters as the
 * original site, so delivery keeps working unchanged. EmailJS is loaded on
 * first submit only. Errors are announced and tied to fields; the original
 * success/error copy is used for both the toast and the inline status.
 */
export function ContactForm() {
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const validate = (data: FormData) => {
    const next: Partial<Record<Field, string>> = {};
    for (const f of FIELDS) {
      const value = String(data.get(f.key) ?? "").trim();
      if (f.required && !value) next[f.key] = ERRORS[f.key];
      if (f.key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) next.email = ERRORS.email;
    }
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    const firstInvalid = FIELDS.find((f) => found[f.key]);
    if (firstInvalid) {
      form.current?.querySelector<HTMLElement>(`[name="${firstInvalid.key}"]`)?.focus();
      return;
    }

    const value = (k: Field) => String(data.get(k) ?? "").trim();
    setStatus("sending");
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      const res = await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          name: value("name"),
          from_name: value("name"),
          email: value("email"),
          from_email: value("email"),
          subject: value("subject"),
          message: value("message"),
          to_name: profile.name,
        },
        { publicKey: emailjsConfig.publicKey },
      );
      if (res.status !== 200) throw new Error(`EmailJS status ${res.status}`);
      setStatus("sent");
      form.current?.reset();
      import("sonner").then(({ toast }) =>
        toast.success("Message sent successfully!", { description: "I'll get back to you within 24 hours." }),
      );
    } catch (err) {
      console.error("Email sending error:", err);
      setStatus("error");
      import("sonner").then(({ toast }) =>
        toast.error("Failed to send message", { description: "Please try again or contact me directly." }),
      );
    }
  };

  const statusText =
    status === "sending" ? "Sending…" : status === "sent" ? copy.formSuccess : status === "error" ? copy.formError : "";

  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-labelledby={`${uid}-title`} className="space-y-10">
      <h3 id={`${uid}-title`} className="t-label text-muted">
        Send a Message
      </h3>
      <div className="grid gap-x-gutter gap-y-10 md:grid-cols-2">
        {FIELDS.map((f) => {
          const id = `${uid}-${f.key}`;
          const err = errors[f.key];
          const common = {
            id,
            name: f.key,
            placeholder: f.placeholder,
            autoComplete: f.autoComplete,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": err ? `${id}-error` : undefined,
            "aria-required": f.required || undefined,
            onInput: () => err && setErrors((cur) => ({ ...cur, [f.key]: undefined })),
            className:
              "peer block w-full resize-none border-0 border-b bg-transparent px-0 pb-3 pt-2 text-[clamp(1.1rem,0.95rem+0.6vw,1.5rem)] text-fg outline-none transition-colors duration-300 placeholder:text-subtle focus:border-accent aria-invalid:border-danger " +
              (err ? "border-danger" : "border-line-strong"),
          };
          return (
            <div key={f.key} className={f.multiline ? "md:col-span-2" : ""}>
              <label htmlFor={id} className="t-label flex justify-between text-muted">
                <span>{f.label}</span>
                {!f.required && <span className="text-subtle">Optional</span>}
              </label>
              {f.multiline ? <textarea rows={4} {...common} /> : <input type={f.type ?? "text"} {...common} />}
              {err && (
                <p id={`${id}-error`} className="t-label mt-2 text-danger">
                  {err}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <Button type="submit" variant="accent" icon={ArrowRight} disabled={status === "sending"} className="disabled:opacity-60">
          {status === "sending" ? "Sending" : "Send Message"}
        </Button>
        <p role="status" aria-live="polite" className={`text-sm ${status === "error" ? "text-danger" : "text-muted"}`}>
          {statusText}
        </p>
      </div>
    </form>
  );
}
