import React, { useState, useEffect } from "react";

import { Menu, Icon } from 'semantic-ui-react'
import 'semantic-ui-less/semantic.less'

const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

const Pagination = (props) => {
    const {
        totalRecords,
        pageLimit,
        pageNeighbours,
        onPageChanged,
        currentPage
    } = props;

    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        setTotalPages(Math.ceil(totalRecords / pageLimit));
    }, []);

    const fetchPageNumbers = () => {
        const totalNumbers = pageNeighbours * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

            let pages = range(startPage, endPage);

            const hasLeftSpill = startPage > 2;
            const hasRightSpill = totalPages - endPage > 1;
            const spillOffset = totalNumbers - (pages.length + 1);

            switch (true) {
                case hasLeftSpill && !hasRightSpill: {
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = [LEFT_PAGE, ...extraPages, ...pages];
                    break;
                }
                case hasLeftSpill && hasRightSpill:
                default: {
                    pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                    break;
                }
            }
            return [1, ...pages, totalPages];
        }
        return range(1, totalPages);
    };

    const pages = fetchPageNumbers() || [];
    return (
        <>
            <Menu floated='right' pagination>
                {pages.map((page, index) => {
                    if (page === LEFT_PAGE) {
                        return (
                            <Menu.Item
                                as='a'
                                icon
                                key={index}
                                onClick={(e) => onPageChanged(e, pageNeighbours * 2 - 1)}
                            >
                                <Icon name='chevron left' />
                            </Menu.Item>
                        );
                    }

                    if (page === RIGHT_PAGE) {
                        return (
                            <Menu.Item
                                as='a'
                                icon
                                key={index}
                                onClick={(e) => onPageChanged(e, pageNeighbours * 2 + 1)}
                            >
                                <Icon name='chevron right' />
                            </Menu.Item>
                        );
                    }

                    return (
                        <Menu.Item
                            as='a'
                            className={currentPage === page ? " active" : ""}
                            key={index}
                            onClick={(e) => onPageChanged(e, page)}>{page}</Menu.Item>
                    );
                })}
            </Menu>
        </>
    );
};

export default Pagination;