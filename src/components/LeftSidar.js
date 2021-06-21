import React, { useState, useEffect } from 'react';

import { Menu } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'
import { useHistory } from 'react-router-dom';

const LeftSidebar = () => {
    const [activeItem, setActiveItem] = useState('Pricing')

    const history = useHistory()
    const panes = [
        {
            menuItem: 'Pricing',
            navLink: "/pricing",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 10'
            }
        },
        {
            menuItem: 'Pricing2',
            navLink: "/pricing2",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 18'
            }
        },
        {
            menuItem: 'Spending',
            navLink: "/spending",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 8'
            }
        },
        {
            menuItem: 'Overview',
            navLink: "/overview",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 1'
            }
        },
        {
            menuItem: 'Overview2',
            navLink: "/overview2",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 13'
            }
        },
        {
            menuItem: 'Overview3',
            navLink: "/overview3",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 15'
            }
        },
        {
            menuItem: 'IG Chart',
            navLink: "/ig-chart",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 14'
            }
        },
        {
            menuItem: 'IG Price Charts',
            navLink: "/ig-price-charts",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 5'
            }
        },
        {
            menuItem: 'IG Price Charts2',
            navLink: "/ig-price-charts2",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 16'
            }
        },
        {
            menuItem: 'IG Price Overview',
            navLink: "/ig-price-overview",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 4'
            }
        },
        {
            menuItem: 'IG ISA',
            navLink: "/ig-isa",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 2'
            }
        },
        {
            menuItem: 'IG ISA2',
            navLink: "/ig-isa2",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 17'
            }
        },
        {
            menuItem: 'IG ISA Breakdown',
            navLink: "/ig-isa-breakdown",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 3'
            }
        },
        {
            menuItem: 'TX Summary',
            navLink: "/tx-summary",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 11'
            }
        },
        {
            menuItem: 'TX Category',
            navLink: "/tx-category",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 7'
            }
        },
        {
            menuItem: 'TX Search',
            navLink: "/tx-search",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 6'
            }
        },
        {
            menuItem: 'TX List',
            navLink: "/tx-list",
            pane: {
                style: { marginTop: 0, marginBottom: 0 },
                key: 'Tab 12'
            }
        }
    ];

    const handleItemClick = (e, { name, value }) => {
        setActiveItem(name)
        history.push(value)
    }

    return (
        <Menu pointing secondary vertical>
            {panes.map((element, index) => {
                return <Menu.Item
                    key={index}
                    name={element.menuItem}
                    value={element.navLink}
                    active={activeItem === element.menuItem}
                    onClick={handleItemClick}
                />
            })}
        </Menu>
    )
}

export default LeftSidebar
