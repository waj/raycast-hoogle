import { useState } from "react";
import { ActionPanel, Icon, List, Color, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { htmlToMarkdown, htmlToText } from "./markdown";

interface HooglePackage {
  name?: string;
  url?: string;
}

interface HoogleModule {
  name?: string;
  url?: string;
}

interface HoogleResult {
  item: string;
  docs: string;
  type: string;
  package: HooglePackage;
  module: HoogleModule;
  url: string;
}

const useHoogle = (q: string) => {
  return useFetch<HoogleResult[]>(`https://hoogle.haskell.org?hoogle=${q}&mode=json`, { execute: q != "" });
};

const titleAndSubtitle = (item: HoogleResult): [string, string?] => {
  const text = htmlToText(item.item);

  if (item.type == "package" || item.type == "module") {
    return [text];
  }

  const parts = text.split(" ");

  if (parts[1] == "::") {
    return [parts[0], parts.slice(1).join(" ")];
  }

  return [text];
};

const hoogleIcon = (item: HoogleResult) => {
  switch (item.type) {
    case "package":
      return Icon.Box;

    case "module":
      return Icon.BlankDocument;

    default:
      return Icon.Hashtag;
  }
};

function Detail(item: HoogleResult) {
  return <List.Item.Detail markdown={htmlToMarkdown(item.docs)} />;
}

function Accessories(item: HoogleResult) {
  const accessories = [];
  if (item.package.name) {
    accessories.push({ text: { value: item.package.name } });
  }

  if (item.module.name) {
    accessories.push({ text: { value: item.module.name, color: Color.Orange } });
  }
  return accessories;
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const { isLoading, data } = useHoogle(searchText);
  const [showDetail, setShowDetail] = useState(false);
  const items = data || [];

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      isLoading={isLoading}
      isShowingDetail={showDetail && items.length > 0}
      throttle={true}
    >
      {items.map((item, index) => {
        const [title, subTitle] = titleAndSubtitle(item);
        const icon = hoogleIcon(item);

        return (
          <List.Item
            key={`${searchText}-${index}`}
            title={title}
            subtitle={subTitle}
            icon={icon}
            detail={Detail(item)}
            accessories={showDetail ? null : Accessories(item)}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={item.url} />
                <Action
                  title="Toggle Docs"
                  icon={Icon.Document}
                  shortcut={{ key: "tab", modifiers: [] }}
                  onAction={() => setShowDetail(!showDetail)}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
