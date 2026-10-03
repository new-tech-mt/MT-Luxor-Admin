import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  LoaderCircle
} from "lucide-react";

import api from "../api/client";

import {
  PageHeading,
  PageLoader
} from "./Dashboard";

const blank = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  active: true
};

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    ...blank
  });

  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/categories/all");

      setCategories(
        res.data?.categories || []
      );
    } catch (err) {
      console.error(
        "Categories load error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm({
      ...blank
    });

    setSelectedFile(null);
    setPreviewUrl("");
    setEditing(null);
    setError("");
    setSuccess("");
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function edit(category) {
    setEditing(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url || "",
      active: category.active !== false
    });

    setSelectedFile(null);
    setPreviewUrl(
      category.image_url || ""
    );

    setError("");
    setSuccess("");
    setOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;

    setOpen(false);
    resetForm();
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

    setError("");
    setSuccess("");
  }

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

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
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be 5MB or less."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const localPreview =
      URL.createObjectURL(file);

    setPreviewUrl(localPreview);
  }

  async function uploadImage(file) {
    if (!file) return null;

    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    try {
      setUploading(true);
      setError("");

      const response =
        await api.post(
          "/uploads/categories",
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
        "Category image upload error:",
        err
      );

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        "Unable to upload category image."
      );

    } finally {
      setUploading(false);
    }
  }

  async function save(event) {
    event.preventDefault();

    if (saving || uploading) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let imageUrl =
        form.image_url || null;

      /*
        If a new image was selected,
        upload it first.
      */
      if (selectedFile) {
        imageUrl =
          await uploadImage(
            selectedFile
          );
      }

      const payload = {
        name:
          form.name.trim(),

        slug:
          form.slug.trim(),

        description:
          form.description.trim(),

        image_url:
          imageUrl,

        active:
          form.active
      };

      if (editing) {
        await api.put(
          `/categories/${editing}`,
          payload
        );
      } else {
        await api.post(
          "/categories",
          payload
        );
      }

      setSuccess(
        editing
          ? "Category updated successfully."
          : "Category created successfully."
      );

      setOpen(false);
      resetForm();

      await load();

    } catch (err) {
      console.error(
        "Category save error:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/categories/${id}`
      );

      setSuccess(
        "Category deleted successfully."
      );

      await load();

    } catch (err) {
      console.error(
        "Category delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete category."
      );
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <PageHeading
        eyebrow="CATALOG"
        title="Categories"
        description="Organize your watch collection."
        action={
          <button
            className="primary-btn"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add Category
          </button>
        }
      />

      {error && !open && (
        <div className="alert">
          {error}
        </div>
      )}

      {success && !open && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="category-grid">
        {categories.map(
          (category) => (
            <div
              className="category-card"
              key={category.id}
            >
              {category.image_url ? (
                <img
                  src={
                    category.image_url
                  }
                  alt={category.name}
                />
              ) : (
                <div className="category-placeholder">
                  MT
                </div>
              )}

              <div className="category-info">
                <span>
                  {category.slug}
                </span>

                <h3>
                  {category.name}
                </h3>

                <p>
                  {category.description ||
                    "No description."}
                </p>

                <div className="category-meta">
                  <span
                    className={`status ${
                      category.active === false
                        ? "status-inactive"
                        : "status-active"
                    }`}
                  >
                    {category.active === false
                      ? "Inactive"
                      : "Active"}
                  </span>
                </div>

                <div className="category-actions">
                  <button
                    onClick={() =>
                      edit(category)
                    }
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      remove(category.id)
                    }
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {categories.length === 0 && (
          <div className="empty-state">
            No categories created yet.
          </div>
        )}
      </div>

      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving &&
              !uploading
            ) {
              closeModal();
            }
          }}
        >
          <div className="modal category-modal">
            <div className="modal-header">
              <div>
                <span>
                  {editing
                    ? "EDIT"
                    : "NEW"}
                </span>

                <h2>
                  {editing
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  uploading
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={save}
              className="admin-form"
            >
              <div className="form-grid">
                <label>
                  Category Name

                  <input
                    name="name"
                    value={
                      form.name
                    }
                    required
                    placeholder="e.g. Luxury Watches"
                    onChange={
                      handleChange
                    }
                  />
                </label>

                <label>
                  Slug

                  <input
                    name="slug"
                    value={
                      form.slug
                    }
                    required
                    placeholder="luxury-watches"
                    onChange={
                      handleChange
                    }
                  />
                </label>
              </div>

              <div className="category-image-upload">
                <label>
                  Category Image
                </label>

                <div className="category-image-upload-box">
                  <div className="category-image-preview">
                    {previewUrl ? (
                      <img
                        src={
                          previewUrl
                        }
                        alt="Category preview"
                      />
                    ) : (
                      <div className="category-image-empty">
                        <ImageIcon
                          size={28}
                        />

                        <span>
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="category-image-content">
                    <strong>
                      {selectedFile
                        ? selectedFile.name
                        : form.image_url
                        ? "Current category image"
                        : "Choose category image"}
                    </strong>

                    <span>
                      JPG, PNG or WEBP · Max 5MB
                    </span>

                    <label className="category-upload-btn">
                      <Upload
                        size={15}
                      />

                      {uploading
                        ? "Uploading..."
                        : "Choose File"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleFileChange
                        }
                        disabled={
                          saving ||
                          uploading
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label>
                Description

                <textarea
                  name="description"
                  rows="4"
                  value={
                    form.description
                  }
                  placeholder="Describe this category..."
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active
                  }
                  onChange={
                    handleChange
                  }
                />

                Active
              </label>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={
                  saving ||
                  uploading
                }
              >
                {saving ||
                uploading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />

                    {uploading
                      ? "Uploading Image..."
                      : "Saving..."}
                  </>
                ) : (
                  editing
                    ? "Update Category"
                    : "Create Category"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}