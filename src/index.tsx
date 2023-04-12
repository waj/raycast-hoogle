import { useState } from "react";
import { ActionPanel, Icon, List, Color, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface HooglePackage {
  name?: string,
  url?: string,
}

interface HoogleModule {
  name?: string,
  url?: string,
}

interface HoogleResult {
  item: string,
  docs: string,
  type: string,
  package: HooglePackage,
  module: HoogleModule,
  url: string,
}

enum HoogleType {
  Package,
  Module,
  Data,
  Function
}

const useHoogle = (q: string) => {
  return useFetch<HoogleResult[]>(
    `https://hoogle.haskell.org?hoogle=${q}&mode=json`,
    { execute: q != "" }
  );
}

const fromHtml = (html: string): [string, string?] => {
  const text = html
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&gt;", ">")

  const parts = text.split("::", 2)

  return [parts[0], parts[1]]
}

const toMarkdown = (html: string): string =>
  html
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("<a>", "*")
    .replaceAll("</a>", "*")
    .replaceAll("<b>", "**")
    .replaceAll("</b>", "**")
    .replaceAll("<pre>", "```")
    .replaceAll("</pre>", "```")
    .replaceAll("<tt>", "`")
    .replaceAll("</tt>", "`")
    .replaceAll("<h1>", "# ")
    .replaceAll("</h1>", "")
    .replaceAll("<h2>", "## ")
    .replaceAll("</h2>", "")
    .replaceAll("<h3>", "### ")
    .replaceAll("</h3>", "")
    .replaceAll("<h4>", "#### ")
    .replaceAll("</h4>", "")


const hoogleType = (item: HoogleResult): HoogleType | undefined => {
  switch (item.type) {
    case "package":
      return HoogleType.Package;

    case "module":
      return HoogleType.Module;

    default:
      break;
  }
}

const hoogleIcon = (type: HoogleType | undefined) => {
  switch (type) {
    case HoogleType.Package:
      return Icon.Box

    case HoogleType.Module:
      return Icon.BlankDocument

    default:
      return Icon.Code
  }
}

export default function Command() {
  const [searchText, setSearchText] = useState("")
  const { isLoading, data } = useHoogle(searchText)
  const [showDetail, setShowDetail] = useState(false)

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      isLoading={isLoading}
      isShowingDetail={showDetail}
      throttle={true}>
      {(data || []).map((item, index) => {
        const [title, subTitle] = fromHtml(item.item)
        const icon = hoogleIcon(hoogleType(item))
        const accessories = []

        if (item.package.name) {
          accessories.push({ text: { value: item.package.name } })
        }

        if (item.module.name) {
          accessories.push({ text: { value: item.module.name, color: Color.Orange } })
        }

        accessories.push({ icon: icon })


        return <List.Item
          key={index}
          title={title}
          subtitle={subTitle}
          detail={<List.Item.Detail markdown={toMarkdown(item.docs)} />}
          accessories={accessories}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={item.url} />
              <Action
                title="Toggle Docs"
                icon={Icon.Document}
                shortcut={{ key: "tab", modifiers: [] }}
                onAction={() => setShowDetail(!showDetail)} />
            </ActionPanel>
          }
        />
      })}
    </List>
  );
}
