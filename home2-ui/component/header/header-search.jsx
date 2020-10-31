import React, {useEffect, useMemo, useState} from "react";
import {Loading} from "../../data/reduce/global/enums";
import {useSearch, useSearchQuery, useSearchResults, useSearchStatus} from "../../data/reduce/search";
import {reportError} from "../../utils/error-reporting";
import Link from "next/link";
import maxBy from "lodash/maxBy";
import throttle from "lodash/throttle";
import {BlogPath, ProjectsPath} from "../../utils/paths";
import dynamic from "next/dynamic";

export const HeaderSearch = function () {

    let onSearch = useSearch();
    let loading = useSearchStatus();
    let query = useSearchQuery() || "";
    let rawResults = useSearchResults() || [];
    let results = useVisualResults(query, rawResults);
    console.debug(`Showing search results for term '${query}':`, results);

    let onSearchChange = throttle(onSearch, 300, {leading: true});

    return <HeaderSearchStateless {...{loading, results, onSearchChange}}/>
};

export const HeaderSearchStateless = function ({loading, results, onSearchChange}) {
    let [query, setQuery] = useState("");
    let onChange = (e, {value}) => {
        setQuery(value);
        onSearchChange(value);
    };
    const Search = dynamic(() => import("semantic-ui-react/dist/commonjs/modules/Search"));
    return <Search category size="mini" aligned="right"
                   className="item"
                   loading={loading === Loading.LOADING}
                   results={results}
                   onSearchChange={onChange}
                   resultRenderer={HeaderSearchResult}
                   value={query} />
};

export const HeaderSearchResult = ({ title, description, url }) =>
    <Link href={url}>
        <a className='content'>
            {title && <div className='title'>{title}</div>}
            {description && <div className='description'>{description}</div>}
        </a>
    </Link>

function toVisualResult(fuse, query, type, value) {
    switch (type) {
        case "article":
            return {
                url: `${BlogPath}/${value.id}`,
                title: value.title,
                description: toVisualResultDescription(fuse, query, value.title, value.id, value.content, ...(value.tags)),
            }
        case "project":
            return {
                url: `${ProjectsPath}/${value.id}`,
                title: value.title,
                description: toVisualResultDescription(fuse, query, value.title, value.id, value.description, ...(value.links || []).map(v => v.name)),
            }
        case "owner":
            return {
                url: "/",
                title: "Owner",
                description: toVisualResultDescription(fuse, query, value.name, value.nickname, value.description, value.bio),
            }
        default:
            console.error(`Unknown search result type ${type} when visualising for the search field`);
            reportError({errorClass: "search", errorMessage: `Unsupported search result type ${type}`});
            return null;
    }
}

function toVisualResultDescription(fuse, query, ...candidates) {
    if (!fuse) return "preview unavailable";
    let result = new fuse(candidates, {includeScore: true}).search(query);
    if (!result.length) {
        return "preview unavailable";
    }
    let value = maxBy(result, r => -r.score).item;
    if (value && value.length > 50) {
        return value.substring(0, 50) + "...";
    } else {
        return value;
    }
}

function useVisualResults(query, raw) {
    const [fuse, setFuse] = useState(null);
    useEffect(() => {
        import("fuse.js").then(setFuse);
    }, []);
    return useMemo(() => {
        let result = {};
        raw.forEach(({value, type}) => {
            let content = toVisualResult(fuse, query, type, value);
            result[type] = result[type] || {name: type, results: []}
            result[type].results.push(content);
        });
    }, [fuse, query, raw]);
}
