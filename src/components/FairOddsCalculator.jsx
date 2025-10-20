import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function FairOddsCalculator() {
  const [tab, setTab] = useState('1x2');
  const [theme, setTheme] = useState('dark');

  const [home, setHome] = useState('1.66');
  const [draw, setDraw] = useState('3.80');
  const [away, setAway] = useState('5.00');
  const [asianHome, setAsianHome] = useState('1.90');
  const [asianAway, setAsianAway] = useState('1.90');
  const [over, setOver] = useState('1.85');
  const [under, setUnder] = useState('1.95');
  // New state for double chance odds
  const [dc1x, setDc1x] = useState('1.20');
  const [dc12, setDc12] = useState('1.40');
  const [dcx2, setDcx2] = useState('1.80');

  const [results, setResults] = useState(null);
  const [pick, setPick] = useState('1');
  const [myOdds, setMyOdds] = useState('');
  const [ev, setEv] = useState(null);

  // Log when state changes
  console.log('Component rendered with state:', { tab, home, draw, away, asianHome, asianAway, over, under });
  
  // Log when tab changes
  React.useEffect(() => {
    console.log('Tab changed to:', tab);
  }, [tab]);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.classList.toggle('light-mode', savedTheme === 'light');
  }, []);

  // Log when results change
  useEffect(() => {
    console.log('Results updated:', results);
  }, [results]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('light-mode', newTheme === 'light');
  };

  const calc = () => {
    console.log('Calc function called for tab:', tab);
    console.log('Current state values:', { home, draw, away, asianHome, asianAway, over, under });
    
    let p = [];
    let originalOdds = [];
    
    if (tab === '1x2') {
      const h = toNum(home), d = toNum(draw), a = toNum(away);
      console.log('1x2 odds:', { h, d, a });
      originalOdds = [h, d, a];
      p = [1 / h, 1 / d, 1 / a];
      console.log('1x2 probabilities:', p);
    } else if (tab === 'asian') {
      const h = toNum(asianHome), a = toNum(asianAway);
      console.log('Asian odds:', { h, a });
      originalOdds = [h, a];
      p = [1 / h, 1 / a];
      console.log('Asian probabilities:', p);
    } else if (tab === 'ou') {
      const o = toNum(over), u = toNum(under);
      console.log('Over/Under odds:', { o, u });
      originalOdds = [o, u];
      p = [1 / o, 1 / u];
      console.log('Over/Under probabilities:', p);
    } else if (tab === 'doublechance') {
      // New Double Chance calculation using the correct mathematical model
      try {
        const toNum = x => parseFloat(String(x).replace(',', '.'));
        const o1 = toNum(dc1x), o2 = toNum(dc12), o3 = toNum(dcx2);
        
        // Validate odds
        if ([o1,o2,o3].some(v => !(v > 1))) throw new Error("Odds must be greater than 1");

        // Step 1: Calculate implied probabilities
        const q1 = 1/o1, q2 = 1/o2, q3 = 1/o3;
        const k = (q1 + q2 + q3) / 2;

        // Step 2: Calculate underlying probabilities (H, D, A)
        let H = (q2 + q1 - q3) / (2*k);
        let D = (q1 + q3 - q2) / (2*k);
        let A = (q2 + q3 - q1) / (2*k);

        // Clamp and renormalize
        const clamp = v => Math.max(0, Math.min(1, v));
        H = clamp(H); D = clamp(D); A = clamp(A);
        const s = H + D + A; 
        if (s > 0) {
          H/=s; D/=s; A/=s;
        }

        // Calculate fair probabilities for Double Chance markets
        const f1X = H + D, f12 = H + A, fX2 = D + A;
        const FO1 = 1/f1X, FO2 = 1/f12, FO3 = 1/fX2;

        // Calculate edges
        const edge1 = (o1 - FO1)/FO1*100;
        const edge2 = (o2 - FO2)/FO2*100;
        const edge3 = (o3 - FO3)/FO3*100;

        // Step 3: Prepare results with the requested key figures
        const result = {
          rows: [
            {type:"1X", bookie:o1, fair:FO1, q:q1*100, fairP:f1X*100, edge:edge1},
            {type:"12", bookie:o2, fair:FO2, q:q2*100, fairP:f12*100, edge:edge2},
            {type:"X2", bookie:o3, fair:FO3, q:q3*100, fairP:fX2*100, edge:edge3},
          ],
          // Key figures as requested
          underlying_1x2_total_probability: (k * 100).toFixed(2) + "%",
          bookmaker_margin: ((k - 1) * 100).toFixed(2) + "%",
          fair_payout: ((1 / k) * 100).toFixed(2) + "%",
          // Consistency check
          overlap_check: Math.abs((q1 + q2 + q3) - 2 * k),
          // Validation check
          valid: q1 + q2 >= q3 && q1 + q3 >= q2 && q2 + q3 >= q1
        };

        setResults(result);
        return;
      } catch (error) {
        console.error('Error calculating Double Chance odds:', error);
        // Fallback to previous method if there's an error
        const dc1xVal = toNum(dc1x), dc12Val = toNum(dc12), dcx2Val = toNum(dcx2);
        originalOdds = [dc1xVal, dc12Val, dcx2Val];
        p = [1 / dc1xVal, 1 / dc12Val, 1 / dcx2Val];
      }
    } else {
      console.log('Unknown tab:', tab);
      return;
    }

    // For non-Double Chance tabs, use the standard calculation
    if (tab !== 'doublechance') {
      const sum = p.reduce((a, b) => a + b, 0);
      const overRound = sum - 1;
      const fairP = p.map((x) => x / sum);
      const fairO = fairP.map((x) => 1 / x);

      console.log('Calculation results:', { sum, overRound, payout: 1 - overRound, fairP, fairO });
      
      const result = { 
        sum: fmtPct(sum), 
        overRound: fmtPct(overRound), 
        payout: fmtPct(1 - overRound), 
        fairP: fairP.map(fmtPct), 
        fairO: fairO.map(fmt2),
        originalOdds: originalOdds.map(fmt2)
      };
      console.log('Setting results:', result);
      setResults(result);
    }
  };

  const testCalc = () => {
    // Force a calculation for testing
    console.log('TestCalc called for tab:', tab);
    calc();
  };

  const toNum = (v) => {
    const result = parseFloat(v.replace(',', '.'));
    console.log('Converting', v, 'to number:', result);
    return result;
  };

  const fmtPct = (x) => {
    const result = (x * 100).toFixed(2) + '%';
    console.log('fmtPct called with', x, 'returning', result);
    return result;
  };
  
  const fmt2 = (x) => {
    const result = x.toFixed(2);
    console.log('fmt2 called with', x, 'returning', result);
    return result;
  };

  const calcEV = () => {
    if (!results || !myOdds) return;
    // Get the correct fair odds based on the selected pick
    let selectedIndex = 0;
    if (tab === '1x2') {
      selectedIndex = pick === '1' ? 0 : pick === 'X' ? 1 : 2;
    } else if (tab === 'asian') {
      selectedIndex = pick === 'Home' ? 0 : 1;
    } else if (tab === 'ou') {
      selectedIndex = pick === 'Over' ? 0 : 1;
    } else if (tab === 'doublechance') {
      // Handle double chance selections
      selectedIndex = pick === '1X' ? 0 : pick === '12' ? 1 : 2;
    }
    
    // Make sure the selectedIndex is valid
    if (selectedIndex >= results.fairO.length) {
      return;
    }
    
    const fairOdds = parseFloat(results.fairO[selectedIndex]);
    const fairP = 1 / fairOdds;
    const EV = toNum(myOdds) * fairP - 1;
    setEv(EV.toFixed(3));
  };

  return (
    <div className="max-w-3xl mx-auto p-4" style={{ color: 'var(--text-primary)' }}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark/light mode">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      
      <h1 className="text-2xl font-bold mb-2">Fair Odds Calculator</h1>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        This calculator helps you determine fair odds and the bookmaker's margin (overround) for different betting markets. 
        It removes the bookmaker's edge to show you the true mathematical odds and helps calculate the Expected Value (EV) of your bets.
      </p>

      {/* Simple tab implementation */}
      <div className="w-full">
        <div className="flex rounded-md mb-4 bg-[#121a35] border border-gray-700" style={{ borderBottom: '1px solid #374151' }}>
          <button 
            onClick={() => setTab('1x2')}
            className={`px-4 py-2 flex-1 text-center ${tab === '1x2' ? 'text-blue-500 font-bold' : 'text-white'}`}
            style={{
              fontWeight: 'bold',
              borderBottom: tab === '1x2' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            1X2
          </button>
          <button 
            onClick={() => setTab('asian')}
            className={`px-4 py-2 flex-1 text-center ${tab === 'asian' ? 'text-blue-500 font-bold' : 'text-white'}`}
            style={{
              fontWeight: 'bold',
              borderBottom: tab === 'asian' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            Asian Handicap
          </button>
          <button 
            onClick={() => setTab('ou')}
            className={`px-4 py-2 flex-1 text-center ${tab === 'ou' ? 'text-blue-500 font-bold' : 'text-white'}`}
            style={{
              fontWeight: 'bold',
              borderBottom: tab === 'ou' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            Over/Under
          </button>
          {/* New Double Chance tab */}
          <button 
            onClick={() => setTab('doublechance')}
            className={`px-4 py-2 flex-1 text-center ${tab === 'doublechance' ? 'text-blue-500 font-bold' : 'text-white'}`}
            style={{
              fontWeight: 'bold',
              borderBottom: tab === 'doublechance' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            Double Chance
          </button>
        </div>

        {/* Tab content */}
        <div style={{ display: tab === '1x2' ? 'block' : 'none' }}>
          <Card className="p-4 bg-[#0f1630] border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1">1 – Home</label>
                <Input value={home} onChange={(e) => setHome(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">X – Draw</label>
                <Input value={draw} onChange={(e) => setDraw(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">2 – Away</label>
                <Input value={away} onChange={(e) => setAway(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={calc} className="bg-blue-600 hover:bg-blue-700">Calculate</Button>
              <Button onClick={testCalc} className="bg-green-600 hover:bg-green-700">Test Calc</Button>
            </div>
          </Card>
        </div>

        <div style={{ display: tab === 'asian' ? 'block' : 'none' }}>
          <Card className="p-4 bg-[#0f1630] border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Asian Home</label>
                <Input value={asianHome} onChange={(e) => {
                  console.log('Setting asianHome to:', e.target.value);
                  setAsianHome(e.target.value);
                }} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Asian Away</label>
                <Input value={asianAway} onChange={(e) => {
                  console.log('Setting asianAway to:', e.target.value);
                  setAsianAway(e.target.value);
                }} className="bg-[#121a35] border-gray-600" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={calc} className="bg-blue-600 hover:bg-blue-700">Calculate</Button>
              <Button onClick={testCalc} className="bg-green-600 hover:bg-green-700">Test Calc</Button>
            </div>
          </Card>
        </div>

        <div style={{ display: tab === 'ou' ? 'block' : 'none' }}>
          <Card className="p-4 bg-[#0f1630] border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Over</label>
                <Input value={over} onChange={(e) => {
                  console.log('Setting over to:', e.target.value);
                  setOver(e.target.value);
                }} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Under</label>
                <Input value={under} onChange={(e) => {
                  console.log('Setting under to:', e.target.value);
                  setUnder(e.target.value);
                }} className="bg-[#121a35] border-gray-600" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={calc} className="bg-blue-600 hover:bg-blue-700">Calculate</Button>
              <Button onClick={testCalc} className="bg-green-600 hover:bg-green-700">Test Calc</Button>
            </div>
          </Card>
        </div>

        {/* New Double Chance tab content */}
        <div style={{ display: tab === 'doublechance' ? 'block' : 'none' }}>
          <Card className="p-4 bg-[#0f1630] border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-gray-400 text-sm block mb-1">1X – Home or Draw</label>
                <Input value={dc1x} onChange={(e) => setDc1x(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">12 – Home or Away</label>
                <Input value={dc12} onChange={(e) => setDc12(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">X2 – Draw or Away</label>
                <Input value={dcx2} onChange={(e) => setDcx2(e.target.value)} className="bg-[#121a35] border-gray-600" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={calc} className="bg-blue-600 hover:bg-blue-700">Calculate</Button>
              <Button onClick={testCalc} className="bg-green-600 hover:bg-green-700">Test Calc</Button>
            </div>
          </Card>
        </div>
      </div>

      {results && (
        <Card className="mt-4 p-4 bg-[#0f1630] border-gray-700">
          {/* Updated results display for detailed table view */}
          {tab === 'doublechance' && results.rows ? (
            <div>
              {/* Validation warning */}
              {!results.valid && (
                <div className="bg-yellow-900/50 border border-yellow-700 rounded p-3 mb-4 text-yellow-200 text-sm">
                  ⚠️ Warning: The input odds may not satisfy the triangle inequality conditions. 
                  Please double-check that the odds are valid for a Double Chance market.
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase">
                    <tr>
                      <th scope="col" className="px-4 py-3">Typ</th>
                      <th scope="col" className="px-4 py-3">Bookie Odds</th>
                      <th scope="col" className="px-4 py-3">Fair Odds</th>
                      <th scope="col" className="px-4 py-3">Bookie Implied</th>
                      <th scope="col" className="px-4 py-3">Fair Prob</th>
                      <th scope="col" className="px-4 py-3">Edge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="px-4 py-3 font-medium">{row.type}</td>
                        <td className="px-4 py-3">{row.bookie.toFixed(2)}</td>
                        <td className={`px-4 py-3 font-medium ${row.bookie > row.fair ? 'text-green-400' : 'text-red-400'}`}>
                          {row.fair.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{row.q.toFixed(2)}%</td>
                        <td className="px-4 py-3">{row.fairP.toFixed(2)}%</td>
                        <td className={`px-4 py-3 ${row.edge > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {row.edge.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Underlying 1X2 Total Probability</p>
                  <p className="text-lg font-bold text-blue-400">{results.underlying_1x2_total_probability}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Bookmaker Margin</p>
                  <p className="text-lg font-bold text-yellow-400">{results.bookmaker_margin}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Fair Payout</p>
                  <p className="text-lg font-bold text-green-400">{results.fair_payout}</p>
                </div>
              </div>
              
              {/* Consistency check warning */}
              {results.overlap_check > 0.005 && (
                <div className="mt-3 text-yellow-200 text-sm">
                  ⚠️ Inkonsekventa DC-odds (överlappar inte ≈ 2×k). Kontrollera inmatningen.
                </div>
              )}
            </div>
          ) : tab === 'doublechance' ? (
            <div className="text-center py-4 text-red-400">
              Error calculating Double Chance odds. Please check your input values.
            </div>
          ) : (
            <div>
              <div className={`grid text-center gap-3`} style={{ gridTemplateColumns: `repeat(3, minmax(0, 1fr))` }}>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Bookmaker Margin</p>
                  <p className="text-lg font-bold text-yellow-400">{results.overRound}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Total Odds</p>
                  <p className="text-lg font-bold">{results.sum}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Fair Payout</p>
                  <p className="text-lg font-bold text-green-400">{results.payout}</p>
                </div>
              </div>

              <div className={`grid gap-3 text-center mt-3`} style={{ gridTemplateColumns: `repeat(${
                tab==='1x2' || tab==='doublechance' ? '3' : '2'
              }, minmax(0, 1fr))` }}>
                {results.fairO.map((o, i) => (
                  <div key={i}>
                    <p className="text-gray-400 text-xs mb-1">
                      {tab==='1x2' ? ['1','X','2'][i] : 
                       tab==='asian' ? ['Home','Away'][i] : 
                       tab==='ou' ? ['Over','Under'][i] : ''}
                    </p>
                    <p className="text-lg font-mono font-semibold">{o}</p>
                    <p className="text-xs text-gray-400">({results.fairP[i]})</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="mt-4 p-4 bg-[#0f1630] border-gray-700">
        <h2 className="text-sm font-semibold mb-2 text-gray-300">Expected Value Calculator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Selection (e.g. 1 / Home / Over)</label>
            <Input value={pick} onChange={(e) => setPick(e.target.value)} className="bg-[#121a35] border-gray-600" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Your Odds</label>
            <Input value={myOdds} onChange={(e) => setMyOdds(e.target.value)} className="bg-[#121a35] border-gray-600" />
          </div>
          <div className="flex items-end">
            <Button onClick={calcEV} className="bg-blue-600 hover:bg-blue-700">Calculate EV</Button>
          </div>
        </div>
        {ev && (
          <p className="text-xs mt-2 text-gray-300">
            Expected Value per unit: 
            <span className={ev > 0 ? 'text-green-400' : 'text-red-400'}> {ev}</span>
            <span className="block mt-1 text-gray-400">
              {ev > 0 
                ? '✅ Positive expected value - this bet is mathematically favorable' 
                : '❌ Negative expected value - this bet is not mathematically favorable'}
            </span>
          </p>
        )}
      </Card>
      
      <div className="mt-6 text-xs text-gray-500">
        <p className="mb-1"><strong>How to use:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Enter the bookmaker's odds for each outcome in the selected market</li>
          <li>Click "Calculate" to see the fair odds and bookmaker's margin</li>
          <li>Use the EV calculator to determine if your bet has positive expected value</li>
          <li>Toggle between dark/light mode using the button in the top-right corner</li>
        </ul>
      </div>
    </div>
  );
}