import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About Us</h1>
      <p className="mt-4 text-slate-600">We are a small team building great products for customers.</p>
      <div className="mt-6">
        <Link to="/products" className="rounded bg-slate-900 px-4 py-2 text-white">Browse products</Link>
      </div>
    </div>
  );
}
