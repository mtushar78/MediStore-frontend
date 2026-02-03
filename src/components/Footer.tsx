export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-primary-500 mt-auto">
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-800">&copy; {new Date().getFullYear()} MediStore. Your Trusted Online Medicine Shop.</p>
        <p className="mt-2 text-sm text-gray-600">
          OTC Medicines Only - No Prescription Required
        </p>
      </div>
    </footer>
  );
}
