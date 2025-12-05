export default function ShoppingPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Shopping Mode
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600">
                This is where you'll see your list organized by store aisle while shopping.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
