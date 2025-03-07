export default function Home() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">News Agent</h1>
      <p className="mb-6">This service runs on a schedule to collect and distribute news.</p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p>The system is configured to run daily at 9:00 AM CET via Vercel Cron Jobs.</p>
        <p className="mt-2">To manually trigger the news collection process, use the API endpoint <code>/api/cron</code> with proper authorization.</p>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Debugging</h2>
        <p>If the cron job is not working, check the following:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Verify environment variables are set in Vercel</li>
          <li>Check Vercel logs for any errors</li>
          <li>Test the API endpoint <code>/api/test</code> to validate environment variables</li>
          <li>Ensure the Telegram bot is working and has access to the chat</li>
        </ul>
      </div>
    </main>
  )
} 