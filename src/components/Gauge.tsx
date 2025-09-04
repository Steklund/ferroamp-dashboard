import React from "react";
import styles from "./Gauge.module.css";

interface GaugeProps {
    min: number;
    max: number;
    value: number;
    label: string;
    leftLabel?: string;
    rightLabel?: string;
    arcLeftColor?: string;
    arcRightColor?: string;
    unit?: string;
}

const Gauge: React.FC<GaugeProps> = ({
    min,
    max,
    value,
    label,
    leftLabel,
    rightLabel,
    arcLeftColor = "#888",
    arcRightColor = "#00f",
    unit = "W",
}) => {
    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const startAngle = 135;
    const sweep = 270;

    // Helper to describe arc
    const describeArc = (start: number, end: number, color: string) => {
        const startRad = (Math.PI / 180) * start;
        const endRad = (Math.PI / 180) * end;
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        const largeArcFlag = end - start <= 180 ? "0" : "1";
        return (
            <path
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
            />
        );
    };

    // Needle calculation
    let needleAngle = startAngle;
    let percent = Math.max(0, Math.min(1, (value - min) / (max - min)));
    needleAngle = startAngle + percent * sweep;

    const needleLength = radius - 18;
    const needleRad = (Math.PI / 180) * needleAngle;
    const needleX = center + needleLength * Math.cos(needleRad);
    const needleY = center + needleLength * Math.sin(needleRad);

    // Arc rendering
    let arcs;
    let percent2 = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const arcValueEnd = startAngle + percent2 * sweep;
    arcs = (
        <>
            {describeArc(startAngle, arcValueEnd, arcLeftColor)}
            {describeArc(arcValueEnd, startAngle + sweep, arcRightColor)}
        </>
    );

    return (
        <div className={styles.gaugeContainer}>
            <div className={styles.gaugeLabel}>{label}</div>
            <svg width={size} height={size / 1.}>
                {arcs}
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

export default Gauge;