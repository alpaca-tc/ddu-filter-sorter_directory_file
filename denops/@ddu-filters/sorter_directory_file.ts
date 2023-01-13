import {
  BaseFilter,
  DduItem,
} from "https://deno.land/x/ddu_vim@v2.2.0/types.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.3.2/file.ts";
import { Item } from "https://deno.land/x/ddu_vim@v2.0.0/types.ts";
import { FilterArguments } from "https://deno.land/x/ddu_vim@v2.0.0/base/filter.ts";

type Type = "file" | "directory";

type Params = {
  order: Type[];
};

type FileSourceItem = DduItem & Item<ActionData>;

const isFileSource = (item: DduItem): item is FileSourceItem => {
  return item.__sourceName === "file";
};

const sortItem = (a: FileSourceItem, b: FileSourceItem) =>
  a.word.localeCompare(b.word);

export class Filter extends BaseFilter<Params> {
  override filter(args: FilterArguments<Params>): Promise<DduItem[]> {
    const files: FileSourceItem[] = [];
    const directories: FileSourceItem[] = [];

    args.items.filter(isFileSource).forEach((item) => {
      if (item.action!.isDirectory) {
        directories.push(item);
      } else {
        files.push(item);
      }
    });

    files.sort(sortItem);
    directories.sort(sortItem);

    const items: DduItem[] = [];

    args.filterParams.order.forEach((itemType) => {
      switch (itemType) {
        case "file":
          items.push(...files);
          break;
        case "directory":
          items.push(...directories);
          break;
        default:
          throw new Error(`Unknown itemType given ${itemType}`);
      }
    });

    return Promise.resolve(items);
  }

  override params(): Params {
    return {
      order: ["directory", "file"],
    };
  }
}
