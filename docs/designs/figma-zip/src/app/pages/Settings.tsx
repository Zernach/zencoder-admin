export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your organization preferences
        </p>
      </div>

      {/* Organization Settings */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Organization Settings
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
              Organization Name
            </label>
            <input 
              type="text" 
              value="Acme Corp"
              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
              Organization ID
            </label>
            <input 
              type="text" 
              value="org_abc123xyz"
              className="w-full border-2 border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Dashboard Preferences
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Default Time Range</div>
              <div className="text-xs text-gray-500">Default view for analytics</div>
            </div>
            <select className="border-2 border-gray-300 px-3 py-2 text-sm bg-white">
              <option>Last 24 hours</option>
              <option selected>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Auto Refresh</div>
              <div className="text-xs text-gray-500">Automatically update dashboard</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-6 border-2 border-gray-900 bg-gray-900 relative cursor-pointer">
                <div className="absolute right-0 top-0 bottom-0 w-5 bg-white border-l-2 border-gray-900"></div>
              </div>
              <span className="text-sm text-gray-600">ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Notification Settings
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <input type="checkbox" checked className="mt-1 w-4 h-4 border-2 border-gray-900" />
            <div>
              <div className="text-sm font-medium text-gray-900">Policy Violations</div>
              <div className="text-xs text-gray-500">Notify when policy blocks occur</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" checked className="mt-1 w-4 h-4 border-2 border-gray-900" />
            <div>
              <div className="text-sm font-medium text-gray-900">High Failure Rates</div>
              <div className="text-xs text-gray-500">Alert when failure rate exceeds 10%</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 w-4 h-4 border-2 border-gray-900" />
            <div>
              <div className="text-sm font-medium text-gray-900">Cost Alerts</div>
              <div className="text-xs text-gray-500">Notify when daily costs exceed threshold</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input type="checkbox" checked className="mt-1 w-4 h-4 border-2 border-gray-900" />
            <div>
              <div className="text-sm font-medium text-gray-900">Security Events</div>
              <div className="text-xs text-gray-500">Alert on suspicious activity</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Access */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            API Access
          </h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 uppercase tracking-wide mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value="sk_live_abc123xyz789..."
                className="flex-1 border-2 border-gray-300 px-3 py-2 text-sm font-mono bg-gray-50"
                readOnly
              />
              <button className="border-2 border-gray-900 px-4 py-2 text-sm font-medium uppercase bg-white hover:bg-gray-50">
                Copy
              </button>
            </div>
          </div>
          <div>
            <button className="border-2 border-red-600 px-4 py-2 text-sm font-medium uppercase text-red-600 bg-white hover:bg-red-50">
              Regenerate API Key
            </button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="border-2 border-gray-300 bg-white">
        <div className="border-b-2 border-gray-300 p-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Team Members
          </h2>
          <button className="border-2 border-gray-900 px-4 py-2 text-xs font-medium uppercase bg-white hover:bg-gray-50">
            + Invite
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-900">admin@acme.com</div>
                <div className="text-xs text-gray-500">Admin • You</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-900">john@acme.com</div>
                <div className="text-xs text-gray-500">Member</div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <div className="text-sm font-medium text-gray-900">sarah@acme.com</div>
                <div className="text-xs text-gray-500">Member</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
