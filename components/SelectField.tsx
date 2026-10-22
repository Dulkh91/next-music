'use client'
type Product = { id: number; name: string };

type SelectFieldProps = {
  product: Product[];
  titleLable: string;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  newProduct: string;
  setNewProduct: (value: string) => void;
};

export default function SelectField({
  product,
  titleLable,
  selectedProduct,
  setSelectedProduct,
  newProduct,
  setNewProduct,
}: SelectFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">{titleLable}</legend>

      <select
        className="select select-bordered w-full"
        value={selectedProduct}
        required
        onChange={(event) => {
          setSelectedProduct(event.target.value);
          setNewProduct("");
        }}
      >
        <option value="" disabled>
          ជ្រើសរើស {titleLable}
        </option>

        {product.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}

        <option value="new">+ បញ្ចូលផលិតកម្មថ្មី</option>
      </select>

      {selectedProduct === "new" && (
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="បញ្ចូលឈ្មោះផលិតកម្មថ្មី"
          value={newProduct}
          required
          onChange={(event) => setNewProduct(event.target.value)}
        />
      )}
    </fieldset>
  );
}
