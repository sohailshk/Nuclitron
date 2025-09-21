// @ts-check
'use client'

import React, { useState, useCallback } from 'react'

interface TimelineSliderProps {
  onTimeChange: (range: [number, number]) => void;
  initialRange?: [number, number];
}

const TimelineSlider = ({ 
  onTimeChange, 
  initialRange = [2020, 2025] 
}: TimelineSliderProps) => {
  const [timeRange, setTimeRange] = useState(initialRange);
  const [isDragging, setIsDragging] = useState(false);

  const minYear = 2000;
  const maxYear = 2025;
  const totalYears = maxYear - minYear;

  const handleRangeChange = useCallback((newRange: [number, number]) => {
    setTimeRange(newRange);
    onTimeChange(newRange);
  }, [onTimeChange]);

  // Simplified event type without React.ChangeEvent
  const handleSliderChange = (event: { target: { value: string } }, isStart: boolean) => {
    const value = parseInt(event.target.value);
    if (isStart) {
      if (value < timeRange[1]) {
        const newRange: [number, number] = [value, timeRange[1]];
        handleRangeChange(newRange);
      }
    } else {
      if (value > timeRange[0]) {
        const newRange: [number, number] = [timeRange[0], value];
        handleRangeChange(newRange);
      }
    }
  };

  const getSliderPosition = (year: number): number => {
    return ((year - minYear) / totalYears) * 100;
  };

  // Define CSSProperties type locally
  interface CSSProperties {
    [key: string]: string | number;
  }

  const sliderStyle = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      color: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    } as CSSProperties,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    } as CSSProperties,
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: 0
    } as CSSProperties,
    rangeDisplay: {
      fontSize: '1.2rem',
      fontWeight: '600',
      background: 'rgba(255,255,255,0.2)',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)'
    } as CSSProperties,
    sliderContainer: {
      position: 'relative',
      height: '60px',
      marginBottom: '1rem'
    } as CSSProperties,
    track: {
      position: 'absolute',
      top: '50%',
      left: '0',
      right: '0',
      height: '6px',
      background: 'rgba(255,255,255,0.3)',
      borderRadius: '3px',
      transform: 'translateY(-50%)'
    } as CSSProperties,
    activeTrack: {
      position: 'absolute',
      top: '50%',
      height: '6px',
      background: 'rgba(255,255,255,0.8)',
      borderRadius: '3px',
      transform: 'translateY(-50%)',
      left: `${getSliderPosition(timeRange[0])}%`,
      width: `${getSliderPosition(timeRange[1]) - getSliderPosition(timeRange[0])}%`
    } as CSSProperties,
    slider: {
      position: 'absolute',
      top: '50%',
      width: '100%',
      height: '6px',
      background: 'transparent',
      outline: 'none',
      appearance: 'none',
      transform: 'translateY(-50%)',
      cursor: 'pointer'
    } as CSSProperties,
    yearLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.875rem',
      opacity: 0.8,
      marginTop: '1rem'
    } as CSSProperties,
    controls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem'
    } as CSSProperties,
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    } as CSSProperties,
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      opacity: 0.9
    } as CSSProperties,
    input: {
      padding: '0.75rem',
      borderRadius: '8px',
      border: 'none',
      fontSize: '1rem',
      background: 'rgba(255,255,255,0.15)',
      color: 'white',
      backdropFilter: 'blur(10px)',
      outline: 'none',
      transition: 'all 0.3s ease'
    } as CSSProperties
  };

  // Custom CSS for webkit slider styling
  const sliderCSS = `
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: none;
      transition: transform 0.2s ease;
    }
    
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: none;
    }
  `;

  return (
    <>
      <style>{sliderCSS}</style>
      <div style={sliderStyle.container}>
        <div style={sliderStyle.header}>
          <h2 style={sliderStyle.title}>Time Range Selection</h2>
          <div style={sliderStyle.rangeDisplay}>
            {timeRange[0]} - {timeRange[1]}
          </div>
        </div>

        <div style={sliderStyle.sliderContainer}>
          <div style={sliderStyle.track}></div>
          <div style={sliderStyle.activeTrack}></div>
          
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={timeRange[0]}
            onChange={(e) => handleSliderChange(e, true)}
            style={sliderStyle.slider}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
          
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={timeRange[1]}
            onChange={(e) => handleSliderChange(e, false)}
            style={sliderStyle.slider}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          />
        </div>

        <div style={sliderStyle.yearLabels}>
          <span>{minYear}</span>
          <span>2005</span>
          <span>2010</span>
          <span>2015</span>
          <span>2020</span>
          <span>{maxYear}</span>
        </div>

        <div style={sliderStyle.controls}>
          <div style={sliderStyle.inputGroup}>
            <label style={sliderStyle.label}>Start Year</label>
            <input
              type="number"
              min={minYear}
              max={timeRange[1] - 1}
              value={timeRange[0]}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= minYear && value < timeRange[1]) {
                  handleRangeChange([value, timeRange[1]]);
                }
              }}
              style={sliderStyle.input}
            />
          </div>
          
          <div style={sliderStyle.inputGroup}>
            <label style={sliderStyle.label}>End Year</label>
            <input
              type="number"
              min={timeRange[0] + 1}
              max={maxYear}
              value={timeRange[1]}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value <= maxYear && value > timeRange[0]) {
                  handleRangeChange([timeRange[0], value]);
                }
              }}
              style={sliderStyle.input}
            />
          </div>
          
          <div style={sliderStyle.inputGroup}>
            <label style={sliderStyle.label}>Duration</label>
            <div style={{
              ...sliderStyle.input,
              display: 'flex',
              alignItems: 'center',
              cursor: 'default'
            } as CSSProperties}>
              {timeRange[1] - timeRange[0]} year{timeRange[1] - timeRange[0] !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimelineSlider;