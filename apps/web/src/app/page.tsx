import { redirect } from "next/navigation";

export default function Home() {
  // For the MVP, we just redirect the root page straight to the login portal.
  redirect("/login");
}
