## Пример

Допустим, есть некоторые исходные данные

```ts
const data = [
    ["Boris", "Laptop", "Moscow", "Yes", 168, 75],
    ["Peter", "Desktop", "London", "No", 176, 79],
    ["Peter", "Smartphone", "Moscow", "No", 181, 91],
    ["Jones", "Laptop", "London", "Yes", 162, 58],
    ["George", "Desktop", "London", "No", 179, 83],
    ["Jones", "Smartphone", "Moscow", "Yes", 192, 115],
    ["George", "Laptop", "Moscow", "Yes", 178, 71],
];

// В дальнейшем будут использоваться номера колонок, и чтобы
// не путаться в цифрах, объявим enum
enum Column {
    Name,
    Gadget,
    City,
    Smoker,
    Height,
    Weight,
}
```

В первую очередь необходимо создать таблицу. Для этого нужно объявить
схему таблицу в виде типов колонок:

```ts
import { Table, Schema } from "pivot-table-engine";

const table = Table.create([
    Schema.String,
    Schema.String,
    Schema.String,
    Schema.String,
    Schema.Number,
    Schema.Number,
]);

// добавляем в таблицу исходные данные
table.addRows(data);
```

Следующим шагом создаем сводную таблицу. Метод `setup` устанавливает, по каким
колонкам происходит группировка.

```ts
import { sum } from "pivot-table-engine";

const pivotTable = PivotTable.createFor(table);

pivotTable.setup({
    columns: [Column.City, Column.Smoker],
    rows: [Column.Name, Column.Gadget],
    values: [
        { index: Column.Height, aggregateFunction: sum, label: "Height" },
        { index: Column.Weight, aggregateFunction: sum, label: "Weight" },
    ],
});
```

Чтобы установить фильтры и сортировку используются методы `setFilters` и `setSort`.

```ts
import { equal, filter, gt, sort, za } from "pivot-table-engine";

pivotTable.setFilters([
    filter(Column.Name, equal("Peter")),
    filter(Column.Height, gt(170)),
]);

pivotTable.setSort([sort(Column.City, za())]);
```

Доступные фильтры:

-   equal - ==
-   greaterThenOrEqual или gte - >=
-   greaterThen или gt - >
-   lessThenOrEqual или lte - <=
-   lessThen или lt - <
-   not - !=

Доступные типы сортировки:

-   az - от меньшего к большему
-   za - от больщего к меньшему

Когда все готово, сводная таблица получается методом `aggregate`.

```ts
import { PivotTableView } from "pivot-table-engine";

const result: PivotTableView = pivotTable.aggregate();
```

В результате получается следующий объект:

```
╔═══════════════╤════════════════╗
║ result.offset │ result.columns ║
╟───────────────┼────────────────╢
║ result.rows   │ result.values  ║
╚═══════════════╧════════════════╝
```

`values` представляет из себя массив массивов чисел или NaN для пустых ячеек, для которых
нет пересечения строк и колонок. `columns` и `rows` - массив массивов объектов типа `Cell` с
свойствами `label`, а также `colspan` и `rowspan`, и соответствует тегу `td`:

```html
<td colspan="cell.colspan" rowspan="cell.rowspan">cell.label</td>
```
