import { signOut } from "@/app/auth-actions";
import styles from "./SignOutButton.module.css";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className={styles.button}>
        Sign out
      </button>
    </form>
  );
}
