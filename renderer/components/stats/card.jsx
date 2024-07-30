/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import styles from '@styles/statcard.module.css';
import Card from 'react-bootstrap/Card';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Image from 'next/image';

// import IconError from '@svgs/solid/exclamation-triangle.svg';
// import IconLoading from '@svgs/solid/sync-alt.svg';

import { useState } from 'react';

import * as CommonIcons from 'config/common-icons';

import { Line } from 'react-chartjs-2';
import ChartJS from 'chart.js/auto';

import COLORS from '@dek/colors';
import json from '@hooks/useSwrJSON';

// export const getServerSideProps = async() => {
//     const response = await fetch('http://api.localhost/broadcast');
//     const data = await response.json();
//     const props = {broadcasts: data.result};
//     return {props};
// }

import { SphereSpinner } from 'react-spinners-kit';

const Config = {
    plugins: {
        // show legends for our graph
        legend: {
            display: true,
        },
    },
    lineHeightAnnotation: {
        always: true,
        lineWeight: 1.5,
    },

    //   animate in
    animation: {
        duration: 1,
    },
    maintainAspectRatio: false,
    responsive: true,

    //   show the x and y scales
    scales: {
        x: { display: false },
        y: { display: true },
    },
};

const metric_label = {
    load: 'CPU Load',
    jitter: 'Idle Jitter',
    cpu: 'CPU Usage',
    ram: 'System RAM',
    ip: 'IP Traffic',
    io: 'IO Usage',

    mem: 'MEM',
    swap: 'SWAP',

    disk: 'Disk Usage',
    mem: 'MEM',
    'disk-rw': 'Disk R/W',
    storage: "Disk Space [GiB]"
};

export default function StatCard({ 
    icon, 
    metric, 
    mdata = null, 
    target=0, 
    sizes={xs:12, md:6, xl: 4},
    suffix="%",
}) {
    const IconComponent = icon ? icon : CommonIcons.close;
    const name = metric_label[metric];

    let metrics, error, loading;
    if (mdata !== null) {
        // used when grouping multiple elements
        // console.log('mdata:', mdata)
        loading = mdata.loading;
        metrics = mdata.data?.[metric];
        error = mdata.error;
    } else {
        const url = `/api/stats/${metric}`;
        const opt = { refreshInterval: 5000 };
        const swr = json(url, opt);
        loading = swr.loading;
        metrics = swr.data;
        error = swr.error;
    }

    if (error) return <h1>{error}</h1>;
    if (loading || !metrics)
        return (
            <Col xs={12} md={6} className='mb-2'>
                <Card className='theme-border chartcard'>
                    <Card.Body className='text-start p-0'>
                        <Card.Title className='p-3'>
                            <h4 className='text-end mb-0 whitney-thick'>
                                x.xx{suffix}
                            </h4>
                            <div className={styles.statcard}>
                                <div className={styles.staticon}>
                                    <IconComponent fill='currentColor' />
                                </div>
                            </div>
                        </Card.Title>
                        <div className='px-2 pt-4'>
                            <div className={styles.statname}>
                                <small className='text-end card-text text-success'>
                                    <strong>{name ? name : 'no-title'}</strong>
                                </small>
                            </div>
                        </div>
                        <div className='anal-cavity d-flex justify-content-center'>
                            <div className={styles.staticon}>
                                <SphereSpinner color='currentColor' />
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        );

    // console.log('metrics:', metrics)

    const perc = '5%'; //metrics.label_vals[0][0];

    const { axis_labels, label_vals, label_keys } = metrics;

    const options = {};
    const max_label_color = COLORS.safediff.length - 1;
    const display_xaxis = options.display_xaxis ?? true;
    const display_yaxis = options.display_yaxis ?? true;
    const line_tension = options.line_tension ?? 0.3;
    const point_radius = options.point_radius ?? 0;
    const fill_graph = options.fill_graph ?? true;
    const border_width = options.border_width ?? 2;

    const chart_data = {
        labels: axis_labels,
        datasets: label_keys.reduce((r, label, label_index) => {
            const color = COLORS.safediff[label_index % max_label_color];
            return [
                ...r,
                {
                    label,
                    data: label_vals[label_index],
                    backgroundColor: color?.bg ?? `${color}40`,
                    borderColor: color?.bdr ?? `${color}`,
                    borderWidth: border_width,
                    fill: fill_graph,
                    radius: point_radius,
                    tension: line_tension,
                },
            ];
        }, []),
    };

    const chart_options = {
        responsive: true,
        plugins: {
            legend: {
                // display: false,
                position: 'bottom',
            },
            title: { display: false },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            x: {
                display: display_xaxis,
                title: { display: false },
                ticks: {
                    display: false,
                    // callback: function(value, index, ticks) {
                    //     const limit = label_vals[0].length-1;
                    //     if (index % 25 === 0) {
                    //         return axis_labels[index];
                    //     }
                    //     return null;
                    // }
                },
                reverse: true,
            },
            y: {
                display: display_yaxis,
                ticks: {
                    callback: function (val, index) {
                        return val || 'n/a';
                    },
                },
            },
        },
    };

    return (
        <Col {...sizes} className='mb-2'>
            <Card className='theme-border chartcard'>
                <Card.Body className='text-start p-0'>
                    <Card.Title className='p-3'>
                        <h4 className='text-end mb-0 whitney-thick'>
                            {target === 'sum' ? (
                                label_vals.reduce((r,i) => r+=i[0], 0).toFixed(2) + suffix
                            ) : (
                                label_vals[target][0].toFixed(2) + suffix
                            )}
                        </h4>
                        <div className={styles.statcard}>
                            <div className={styles.staticon}>
                                {/* <Image src={`/svgs/${icon}.svg`} layout='fill' className={styles.staticon} /> */}
                                <IconComponent fill='currentColor' />
                            </div>
                        </div>
                    </Card.Title>
                    <div className='px-2 pt-4'>
                        <div className={styles.statname}>
                            <small className='text-end card-text text-success'>
                                <strong>{name ? name : 'no-title'}</strong>
                            </small>
                        </div>
                        <Line
                            data={chart_data}
                            options={chart_options}
                            className='anal-cavity'
                        />
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
}
