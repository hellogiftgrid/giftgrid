import "server-only";
import catalog from "@/config/supplier-products.json";
import { currentSupplierProducts, parseSupplierCatalog } from "./supplier-schema";

export function getSupplierProducts() {
  return currentSupplierProducts(parseSupplierCatalog(catalog));
}
