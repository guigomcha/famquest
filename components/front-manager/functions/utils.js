const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function collectLogs() {
  // Capture the console's memory information and some performance metrics
  const logData = {
      historyUsage: console.history, // Thanks to console.history in CDN
      performanceData: window.performance.getEntriesByType('resource'),
      timestamp: new Date().toISOString()
  };

  // Export to a file
  BigInt.prototype.toJSON = function() {
    return this.toString();
    };
  const logJson = JSON.stringify(logData, getCircularReplacer(), 2);
  const blob = new Blob([logJson], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'famquest_logs_'+logData.timestamp.split("T")[0]+'.json';
  link.click();
}