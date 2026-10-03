import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Upload,
  Image as ImageIcon,
  LoaderCircle
} from "lucide-react";

import api from "../api/client";

import {
  PageHeading,
  PageLoader
} from "./Dashboard";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_price: "",
  sale_price: "",
  category_id: "",
  images: [],
  stock: 0,
  active: true,
  featured: false
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeImages(images) {
  if (!images) {
    return [];
  }

  if (typeof images === "string") {
    return images.trim() ? [images] : [];
  }

  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      if (image && typeof image === "object") {
        return (
          image.url ||
          image.publicUrl ||
          image.image_url ||
          ""
        );
      }

      return "";
    })
    .filter(Boolean);
}

function makeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractProducts(response) {
  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function extractCategories(response) {
  if (Array.isArray(response?.data?.categories)) {
    return response.data.categories;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileInputRef = useRef(null);

  /* =======================================================
     LOAD PRODUCTS + CATEGORIES
  ======================================================= */

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setCategoryError("");

      /*
        Do not use Promise.all here.

        If categories fail, products should still load.
      */
      const [productsResult, categoriesResult] =
        await Promise.allSettled([
          api.get("/products/all"),
          api.get("/categories/all")
        ]);

      /* ---------------------------------------------------
         PRODUCTS
      --------------------------------------------------- */

      if (productsResult.status === "fulfilled") {
        setProducts(
          extractProducts(productsResult.value)
        );
      } else {
        console.error(
          "Products load error:",
          productsResult.reason
        );

        setProducts([]);

        setError(
          productsResult.reason?.response?.data?.message ||
          productsResult.reason?.message ||
          "Unable to load products."
        );
      }

      /* ---------------------------------------------------
         CATEGORIES
      --------------------------------------------------- */

      if (categoriesResult.status === "fulfilled") {
        const loadedCategories =
          extractCategories(
            categoriesResult.value
          );

        /*
          Only active categories should be available
          when assigning a product.
        */
        setCategories(
          loadedCategories.filter(
            (category) =>
              category &&
              category.is_active !== false
          )
        );
      } else {
        console.error(
          "Categories load error:",
          categoriesResult.reason
        );

        setCategories([]);

        setCategoryError(
          categoriesResult.reason?.response?.data?.message ||
          categoriesResult.reason?.message ||
          "Unable to load categories."
        );
      }
    } catch (err) {
      console.error(
        "Products page load error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load catalog."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================================================
     IMAGE HELPERS
  ======================================================= */

  const getProductImage = (product) => {
    const images =
      normalizeImages(product?.images);

    return images[0] || "";
  };

  /* =======================================================
     PREVIEW CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =======================================================
     CREATE
  ======================================================= */

  const openCreate = () => {
    setEditing(null);

    setForm({
      ...emptyForm,
      images: []
    });

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    setOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (product) => {
    const existingImages =
      normalizeImages(product?.images);

    setEditing(product.id);

    setForm({
      name: product.name || "",

      slug: product.slug || "",

      description:
        product.description || "",

      price:
        product.price ?? "",

      compare_price:
        product.compare_at_price ?? "",

      sale_price:
        product.sale_price ?? "",

      category_id:
        product.category_id || "",

      images:
        existingImages,

      stock:
        product.stock ?? 0,

      active:
        product.is_active !== false,

      featured:
        product.featured === true
    });

    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    setOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     SELECT IMAGE
  ======================================================= */

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      event.target.value = "";
      setSelectedFile(null);
      setPreviewUrl("");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must not exceed 5MB."
      );

      event.target.value = "";
      setSelectedFile(null);
      setPreviewUrl("");

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
    setError("");
  };

  /* =======================================================
     UPLOAD IMAGE
  ======================================================= */

  const uploadImage = async () => {
    if (!selectedFile) {
      return "";
    }

    const formData = new FormData();

    formData.append(
      "image",
      selectedFile
    );

    try {
      setUploading(true);
      setError("");

      const response =
        await api.post(
          "/uploads/products",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      const uploadedImage =
        response.data?.image;

      if (!uploadedImage?.url) {
        throw new Error(
          "Image upload completed but no image URL was returned."
        );
      }

      return uploadedImage.url;
    } catch (err) {
      console.error(
        "Product image upload error:",
        err
      );

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        "Unable to upload product image."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  const save = async (e) => {
    e.preventDefault();

    if (uploading) {
      return;
    }

    setError("");

    try {
      const uploadedImage =
        await uploadImage();

      const existingImages =
        normalizeImages(form.images);

      const finalImages =
        uploadedImage
          ? [uploadedImage]
          : existingImages;

      /*
        Automatically create slug from product name
        if user leaves slug empty.
      */
      const finalSlug =
        form.slug.trim() ||
        makeSlug(form.name);

      if (!form.name.trim()) {
        setError(
          "Product name is required."
        );
        return;
      }

      if (!finalSlug) {
        setError(
          "A valid product slug could not be generated."
        );
        return;
      }

      const numericPrice =
        Number(form.price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        setError(
          "Please enter a valid product price."
        );
        return;
      }

      const payload = {
        name:
          form.name.trim(),

        slug:
          finalSlug,

        description:
          form.description.trim(),

        price:
          numericPrice,

        compare_at_price:
          form.compare_price !== "" &&
          form.compare_price !== null
            ? Number(form.compare_price)
            : null,

        sale_price:
          form.sale_price !== "" &&
          form.sale_price !== null
            ? Number(form.sale_price)
            : null,

        category_id:
          form.category_id || null,

        images:
          finalImages,

        stock:
          Number(form.stock) || 0,

        is_active:
          form.active,

        featured:
          form.featured
      };

      console.log(
        editing
          ? "Updating product:"
          : "Creating product:",
        payload
      );

      if (editing) {
        await api.put(
          `/products/${editing}`,
          payload
        );
      } else {
        await api.post(
          "/products",
          payload
        );
      }

      closeModal();

      await load();
    } catch (err) {
      console.error(
        "Product save error:",
        err
      );

      const serverMessage =
        err.response?.data?.message;

      const serverDetails =
        err.response?.data?.details;

      setError(
        serverMessage ||
        serverDetails ||
        err.message ||
        "Unable to save product."
      );
    }
  };

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const remove = async (id) => {
    if (
      !window.confirm(
        "Delete this product?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/products/${id}`
      );

      await load();
    } catch (err) {
      console.error(
        "Product delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete product."
      );
    }
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filtered =
    products.filter((product) =>
      `${product.name || ""} ${product.slug || ""}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return <PageLoader />;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <PageHeading
        eyebrow="CATALOG"
        title="Products"
        description="Manage every product in your MT Luxor catalog."
        action={
          <button
            className="primary-btn"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add Product
          </button>
        }
      />

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
          />
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="actions-head">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((product) => {
                const productImage =
                  getProductImage(product);

                const displayPrice =
                  product.sale_price !== null &&
                  product.sale_price !== undefined &&
                  Number(product.sale_price) > 0
                    ? product.sale_price
                    : product.price ?? 0;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={
                              product.name ||
                              "Product"
                            }
                          />
                        ) : (
                          <div className="image-placeholder">
                            MT
                          </div>
                        )}

                        <div>
                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      PKR{" "}
                      {Number(
                        displayPrice
                      ).toLocaleString("en-PK")}
                    </td>

                    <td>
                      {product.stock ?? 0}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          product.is_active === false
                            ? "status-inactive"
                            : "status-active"
                        }`}
                      >
                        {product.is_active === false
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(product)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            remove(product.id)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      No products found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <span>
                  {editing ? "EDIT" : "NEW"}
                </span>

                <h2>
                  {editing
                    ? "Edit Product"
                    : "Add Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={save}
              className="admin-form"
            >
              <div className="form-grid">
                <Field
                  label="Product Name"
                  value={form.name}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      name: value
                    })
                  }
                  required
                />

                <Field
                  label="Slug"
                  value={form.slug}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      slug: value
                    })
                  }
                  placeholder="Leave empty to generate automatically"
                />

                <Field
                  label="Price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      price: value
                    })
                  }
                  required
                />

                <Field
                  label="Compare Price"
                  type="number"
                  min="0"
                  value={form.compare_price}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      compare_price: value
                    })
                  }
                />

                <Field
                  label="Sale Price"
                  type="number"
                  min="0"
                  value={form.sale_price}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      sale_price: value
                    })
                  }
                />

                <label>
                  Category

                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category_id:
                          e.target.value
                      })
                    }
                  >
                    <option value="">
                      No category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                  {categoryError && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "6px"
                      }}
                    >
                      {categoryError}
                    </small>
                  )}

                  {!categoryError &&
                    categories.length === 0 && (
                      <small
                        style={{
                          display: "block",
                          marginTop: "6px"
                        }}
                      >
                        No active categories available.
                      </small>
                    )}
                </label>

                <Field
                  label="Stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      stock: value
                    })
                  }
                />
              </div>

              {/* IMAGE UPLOAD */}

              <div className="product-image-upload">
                <label>
                  Product Image
                </label>

                <div className="image-upload-box">
                  <div className="image-upload-preview">
                    {selectedFile && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Selected product"
                      />
                    ) : form.images?.[0] ? (
                      <img
                        src={form.images[0]}
                        alt="Current product"
                      />
                    ) : (
                      <div className="image-upload-empty">
                        <ImageIcon size={30} />

                        <span>
                          No image selected
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="image-upload-content">
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : form.images?.[0]
                          ? "Current product image"
                          : "Upload product image"}
                    </strong>

                    <span>
                      JPG, PNG or WEBP · Maximum 5MB
                    </span>

                    <label className="upload-file-btn">
                      <Upload size={16} />

                      Choose Image

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={
                          handleFileChange
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label>
                Description

                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value
                    })
                  }
                />
              </label>

              <div className="check-row">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        active:
                          e.target.checked
                      })
                    }
                  />

                  Active
                </label>

                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        featured:
                          e.target.checked
                      })
                    }
                  />

                  Featured
                </label>
              </div>

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />

                    Uploading Image...
                  </>
                ) : editing ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   FIELD COMPONENT
========================================================= */

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  placeholder
}) {
  return (
    <label>
      {label}

      <input
        type={type}
        value={value}
        required={required}
        min={min}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </label>
  );
}