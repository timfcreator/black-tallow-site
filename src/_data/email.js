// The email signup, worked out from site.json's "emailFormAction" alone, so there is no second setting to
// keep in step. Buttondown and Kit name the email field differently; posting the wrong name makes the
// provider reject every signup without the page showing any error.
//   Buttondown: https://buttondown.com/api/emails/embed-subscribe/<username>  field "email"
//   Kit:        https://app.kit.com/forms/<form id>/subscriptions             field "email_address"
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("./site.json", import.meta.url), "utf8"));
const action = (site.emailFormAction || "").trim();

let host = "";
if (action) {
  try {
    host = new URL(action).hostname;
  } catch {
    throw new Error(`site.json: emailFormAction is not a web address: "${action}"`);
  }
}
const isKit = host === "kit.com" || host.endsWith(".kit.com") || host.endsWith("convertkit.com");
const isButtondown = host.endsWith("buttondown.com") || host.endsWith("buttondown.email");
if (action && !isKit && !isButtondown) {
  throw new Error(`site.json: emailFormAction should be a Buttondown or Kit form address, not ${host}`);
}

export default {
  action,                                    // empty: no signup anywhere on the site
  provider: isKit ? "Kit" : isButtondown ? "Buttondown" : "",
  field: isKit ? "email_address" : "email",
  hidden: isButtondown ? [{ name: "embed", value: "1" }] : [],
};
