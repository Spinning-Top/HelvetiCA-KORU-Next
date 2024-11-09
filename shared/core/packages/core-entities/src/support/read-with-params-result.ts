export class ReadWithParamsResult {
  private entities: Record<string, unknown>[] = [];
  private total: number = 0;
  private page: number = 1;
  private limit: number = 10;
  private search: string | undefined = undefined;

  public constructor(page: number, limit: number, search?: string) {
    this.setPage(page);
    this.setLimit(limit);
    this.setSearch(search);
  }

  public getEntities(): Record<string, unknown>[] {
    return this.entities;
  }

  public getTotal(): number {
    return this.total;
  }

  public getPage(): number {
    return this.page;
  }

  public getLimit(): number {
    return this.limit;
  }

  public getSearch(): string | undefined {
    return this.search;
  }

  public setEntities(entities: Record<string, unknown>[]): void {
    this.entities = entities;
  }

  public setTotal(total: number): void {
    this.total = total;
  }

  public setPage(page: number): void {
    this.page = Number(page);
    if (this.page < 1) this.page = 1;
  }

  public setLimit(limit: number): void {
    this.limit = Number(limit);
    if (this.limit < 1) this.limit = 10;
  }

  public setSearch(search: string | undefined): void {
    this.search = undefined;
    if (search != undefined) {
      this.search = String(search).trim().toLowerCase();
      if (this.search.length < 3) this.search = undefined;
    }
  }

  public getSkip(): number {
    return this.limit * (this.page - 1);
  }

  public toJson(): Record<string, unknown> {
    return {
      entities: this.entities,
      total: this.total,
      page: this.page,
      limit: this.limit,
    };
  }
}
