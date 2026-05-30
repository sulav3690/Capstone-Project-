/**
 * VeritasAI - EmailJS Integration Script (Static Build)
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("VeritasAI EmailJS Static Script Loaded.");

  document.addEventListener("submit", (event) => {
    const form = event.target;
    
    // We only want to process the feedback / survey forms
    console.log("Form submission intercepted:", form);

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    const selectEl = form.querySelector("select");
    if (selectEl && !data["hear_about_us"]) {
      data["hear_about_us"] = selectEl.value;
    }

    // Default template parameters for EmailJS
    const templateParams = {
      from_name: data.username || "VeritasAI User",
      hear_about_us: data.hear_about_us || "Not specified",
      role: data.role || "Not specified",
      ai_usage: data.ai_usage || "Not specified",
      why_choose_us: Array.isArray(data.why_choose_us) ? data.why_choose_us.join(", ") : (data.why_choose_us || "Not specified"),
      raw_data: JSON.stringify(data, null, 2)
    };

    if (typeof emailjs !== "undefined") {
      emailjs.send("service_98z4snm", "template_r8cy4sw", templateParams)
        .then((response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("Survey sent successfully via EmailJS!");
        }, (error) => {
          console.error("FAILED...", error);
          alert("EmailJS Send Failed: " + JSON.stringify(error));
        });
    } else {
      console.error("EmailJS is not initialized.");
    }
  });
});
