import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "../../data/hooks/global/enums";
import { useSearch } from "../../data/hooks/search";
import { reportError } from "../../utils/error-reporting";
import Link from "next/link";
import maxBy from "lodash/maxBy";
import { BlogPath, ProjectsPath } from "../../utils/paths";
import Fuse from "fuse.js";
import Search from "semantic-ui-react/dist/commonjs/modules/Search";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const { results: rawResults, loading } = useSearch(query);
  const results = useVisualResults(query, rawResults);
  useEffect(() => {
    if (query && results) {
      console.debug(`Showing search results for term '${query}':`, results);
    }
  }, [query, results]);

  return <HeaderSearchStateless query={query} onQueryChange={setQuery} {...{ loading, results }} />;
}

export const HeaderSearchStateless = function ({ query, loading, results, onQueryChange }) {
  return (
    <Search
      category
      size="mini"
      aligned="right"
      data-id="header-search-bar"
      className="item"
      loading={loading === Loading.LOADING}
      results={results}
      onSearchChange={onQueryChange}
      resultRenderer={HeaderSearchResult}
      value={query}
    />
  );
};

export const HeaderSearchResult = ({ title, description, url }) => (
  <Link href={url}>
    <a className="content">
      {title && <div className="title">{title}</div>}
      {description && <div className="description">{description}</div>}
    </a>
  </Link>
);

function toVisualResult(query, type, value) {
  switch (type) {
    case "article":
      return {
        url: `${BlogPath}/${value.id}`,
        title: value.title,
        description: toVisualResultDescription(query, value.title, value.id, value.content, ...value.tags),
      };
    case "project":
      return {
        url: `${ProjectsPath}/${value.id}`,
        title: value.title,
        description: toVisualResultDescription(
          query,
          value.title,
          value.id,
          value.description,
          ...(value.links || []).map((v) => v.name)
        ),
      };
    case "owner":
      return {
        url: "/",
        title: "Owner",
        description: toVisualResultDescription(query, value.name, value.nickname, value.description, value.bio),
      };
    default:
      console.error(`Unknown search result type ${type} when visualising for the search field`);
      reportError({ errorClass: "search", errorMessage: `Unsupported search result type ${type}` });
      return null;
  }
}

function toVisualResultDescription(fuse, query, ...candidates) {
  let result = new Fuse(candidates, { includeScore: true }).search(query);
  if (!result.length) {
    return "preview unavailable";
  }
  let value = maxBy(result, (r) => -r.score).item;
  if (value && value.length > 50) {
    return value.substring(0, 50) + "...";
  } else {
    return value;
  }
}

function useVisualResults(query, raw = []) {
  return useMemo(() => {
    let result = {};
    raw.forEach(({ value, type }) => {
      let content = toVisualResult(query, type, value);
      result[type] = result[type] || { name: type, results: [] };
      result[type].results.push(content);
    });
    return result;
  }, [query, raw]);
}
