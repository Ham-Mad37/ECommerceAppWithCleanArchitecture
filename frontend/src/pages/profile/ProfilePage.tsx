import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { Alert, Field, btnPrimary, card, inputCls } from "../../components/common/ui";
import { getApiError } from "../../utils/format";

type Notice = { kind: "error" | "success"; text: string } | null;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwNotice, setPwNotice] = useState<Notice>(null);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);
    try {
      setSavingProfile(true);
      await authService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      await refreshUser();
      setProfileNotice({ kind: "success", text: "Profile updated." });
    } catch (err) {
      setProfileNotice({ kind: "error", text: getApiError(err, "Unable to update your profile.") });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwNotice(null);
    if (newPassword !== confirm) {
      setPwNotice({ kind: "error", text: "The new passwords do not match." });
      return;
    }
    try {
      setSavingPw(true);
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirm("");
      setPwNotice({ kind: "success", text: "Password changed. Other devices have been signed out." });
    } catch (err) {
      setPwNotice({ kind: "error", text: getApiError(err, "Unable to change your password.") });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My profile</h1>
        <p className="mt-1 text-slate-500">{user?.email}</p>
      </div>

      <form onSubmit={saveProfile} className={`${card} space-y-4 p-6`}>
        <h2 className="font-semibold text-slate-900">Personal details</h2>
        {profileNotice && <Alert kind={profileNotice.kind}>{profileNotice.text}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name"><input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} /></Field>
          <Field label="Last name"><input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={100} /></Field>
        </div>
        <button className={btnPrimary} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save changes"}</button>
      </form>

      <Link to="/addresses" className={`${card} flex items-center gap-4 p-6 transition hover:border-slate-400`}>
        <MapPin className="text-slate-600" />
        <div>
          <p className="font-semibold text-slate-900">Shipping addresses</p>
          <p className="text-sm text-slate-500">Add, edit or remove where we deliver.</p>
        </div>
      </Link>

      <form onSubmit={changePassword} className={`${card} space-y-4 p-6`}>
        <h2 className="font-semibold text-slate-900">Change password</h2>
        {pwNotice && <Alert kind={pwNotice.kind}>{pwNotice.text}</Alert>}
        <Field label="Current password"><input type="password" autoComplete="current-password" className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></Field>
        <Field label="New password" hint="8+ characters with upper and lower case, a number and a symbol."><input type="password" autoComplete="new-password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} /></Field>
        <Field label="Confirm new password"><input type="password" autoComplete="new-password" className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></Field>
        <button className={btnPrimary} disabled={savingPw}>{savingPw ? "Updating..." : "Update password"}</button>
      </form>
    </div>
  );
}
