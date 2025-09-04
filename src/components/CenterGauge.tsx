import React from "react";
import styles from "./Gauge.module.css";

interface CenterGaugeProps {
    min: number;
    max: number;
    value: number;
    label: string;
    leftLabel?: string;
    rightLabel?: string;
    arcLeftColor?: string;
    arcCenterColor?: string;
    arcRightColor?: string;
    unit?: string;
}

const CenterGauge: React.FC<CenterGaugeProps> = ({
    min,
    max,
    value,
    label,
    leftLabel,
    rightLabel,
    arcLeftColor = "#f00",
    arcCenterColor = "#444",
    arcRightColor = "#0a0",
    unit = "W",
}) => {
    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const startAngle = 135;
    const sweep = 270;

    // Calculate zero angle
    const percentLeft = Math.abs(min) / (max - min);
    const zeroAngle = startAngle + percentLeft * sweep;

    // Helper to describe an arc
    const describeArc = (start: number, end: number, color: string) => {
        const startRad = (Math.PI / 180) * start;
        const endRad = (Math.PI / 180) * end;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const deltaAngle = ((end - start + 360) % 360);
        const largeArcFlag = deltaAngle > 180 ? "1" : "0";
        const sweepFlag = end > start ? "1" : "0";

        return (
            <path
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />
        );
    };

    // Needle calculation
    const clampedValue = Math.max(min, Math.min(max, value));
    const percent = (clampedValue - min) / (max - min);
    const needleAngle = startAngle + percent * sweep;
    const needleLength = radius - 18;
    const needleRad = (Math.PI / 180) * needleAngle;
    const needleX = center + needleLength * Math.cos(needleRad);
    const needleY = center + needleLength * Math.sin(needleRad);

    // Determine fill arc
    let fillStart: number, fillEnd: number, fillColor: string;
    if (value < 0) {
        fillStart = needleAngle;
        fillEnd = zeroAngle;
        fillColor = arcLeftColor;
    } else if (value > 0) {
        fillStart = zeroAngle;
        fillEnd = needleAngle;
        fillColor = arcRightColor;
    } else {
        fillStart = zeroAngle;
        fillEnd = zeroAngle + 0.1; // small arc for zero
        fillColor = arcCenterColor;
    }

    return (
        <div className={styles.gaugeContainer}>
            <div className={styles.gaugeLabel}>{label}</div>
            <svg width={size} height={size}>
                {/* Background arcs */}
                {describeArc(startAngle, zeroAngle, arcCenterColor)}
                {describeArc(zeroAngle, startAngle + sweep, arcCenterColor)}

                {/* Filled value arc */}
                {describeArc(fillStart, fillEnd, fillColor)}

                {/* Needle */}
                <line
                    x1={center}
                    y1={center}
                    x2={needleX}
                    y2={needleY}
                    stroke="#444"
                    strokeWidth={8}
                    strokeLinecap="round"
                />
                <circle cx={center} cy={center} r={14} fill="#444" />
            </svg>
            <div className={styles.valueLabel}>
                <span>
                    <b>{value}</b> {unit}
                </span>
            </div>
            <div className={styles.labelsRow}>
                <span className={styles.sideLabel}>{leftLabel}</span>
                <span className={styles.sideLabel}>{rightLabel}</span>
            </div>
        </div>
    );
};

export default CenterGauge;
