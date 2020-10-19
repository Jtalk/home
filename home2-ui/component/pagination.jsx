import {Menu} from "semantic-ui-react";
import Link from "next/link";
import React from "react";

export const Pagination = function ({current, total}) {

    if (total < 2) {
        return null;
    }
    return <Menu pagination floated="right">
        {
            Array(total).fill().map((_, i) => {
                if (current === i) {
                    return <Menu.Item key={i} active>{i + 1}</Menu.Item>
                } else {
                    return <Link key={i} href={"/admin/images/?page=" + i}>
                        <a className="item">{i + 1}</a>
                    </Link>
                }
            })
        }
    </Menu>
};
