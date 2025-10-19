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
    if (tab === '1x2') {
      const h = toNum(home), d = toNum(draw), a = toNum(away);
      console.log('1x2 odds:', { h, d, a });
      p = [1 / h, 1 / d, 1 / a];
      console.log('1x2 probabilities:', p);
    } else if (tab === 'asian') {
      const h = toNum(asianHome), a = toNum(asianAway);
      console.log('Asian odds:', { h, a });
      p = [1 / h, 1 / a];
      console.log('Asian probabilities:', p);
    } else if (tab === 'ou') {
      const o = toNum(over), u = toNum(under);
      console.log('Over/Under odds:', { o, u });
      p = [1 / o, 1 / u];
      console.log('Over/Under probabilities:', p);
    } else {
      console.log('Unknown tab:', tab);
      return;
    }

    const sum = p.reduce((a, b) => a + b, 0);
    const overRound = sum - 1;
    const fairP = p.map((x) => x / sum);
    const fairO = fairP.map((x) => 1 / x);

    console.log('Calculation results:', { sum, overRound, payout: 1 - overRound, fairP, fairO });
    
    const result = { sum: fmtPct(sum), overRound: fmtPct(overRound), payout: fmtPct(1 - overRound), fairP: fairP.map(fmtPct), fairO: fairO.map(fmt2) };
    console.log('Setting results:', result);
    setResults(result);
    console.log('Results set, new results should be:', result);
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
      </div>

      {results && (
        <Card className="mt-4 p-4 bg-[#0f1630] border-gray-700">
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

          <div className={`grid gap-3 text-center mt-3`} style={{ gridTemplateColumns: `repeat(${tab==='1x2' ? '3' : '2'}, minmax(0, 1fr))` }}>
            {results.fairO.map((o, i) => (
              <div key={i}>
                <p className="text-gray-400 text-xs mb-1">
                  {tab==='1x2' ? ['1','X','2'][i] : tab==='asian' ? ['Home','Away'][i] : ['Over','Under'][i]}
                </p>
                <p className="text-lg font-mono font-semibold">{o}</p>
                <p className="text-xs text-gray-400">({results.fairP[i]})</p>
              </div>
            ))}
          </div>

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