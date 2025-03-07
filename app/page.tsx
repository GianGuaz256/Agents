export default function Home() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">News Agent</h1>
      <p className="mb-6">This service runs on a schedule to collect and distribute news.</p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p>The system is configured to run daily at 9:00 AM CET via Vercel Cron Jobs.</p>
        <p className="mt-2">To manually trigger the news collection process, use the API endpoint <code>/api/cron</code> with one of these methods:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Add header <code>x-vercel-cron: 1</code> to simulate a Vercel cron job</li>
          <li>Add header <code>Authorization: Bearer [CRON_SECRET]</code> to authenticate manually</li>
        </ul>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Testing</h2>
        <p>You can test the system configuration with these endpoints:</p>
        <ul className="list-disc ml-6 mt-2">
          <li><code>GET /api/test</code> - Verify environment variables</li>
          <li><code>POST /api/test</code> - Test cron authorization setup</li>
        </ul>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debugging</h2>
        <p>If the cron job is not working, check the following:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Verify environment variables are set in Vercel</li>
          <li>Check Vercel logs for any errors</li>
          <li>Ensure vercel.json has the correct cron configuration</li>
          <li>Ensure the Telegram bot is working and has access to the chat</li>
        </ul>
      </div>
    </main>
  )
} 