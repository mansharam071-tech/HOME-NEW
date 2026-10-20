import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  Power,
  Sparkles,
  Zap,
  AirVent,
  Scissors,
  PaintRoller,
  Bug,
  Tag,
  Clock,
  IndianRupee,
  Shield,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useStore, storeApi, IMG } from "@/lib/store";
import { Category, Service, Addon } from "@/lib/types";
import { inr } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PRESET_ICONS = [
  { name: "Wrench", icon: Wrench },
  { name: "Zap", icon: Zap },
  { name: "Sparkles", icon: Sparkles },
  { name: "AirVent", icon: AirVent },
  { name: "Scissors", icon: Scissors },
  { name: "PaintRoller", icon: PaintRoller },
  { name: "Bug", icon: Bug },
  { name: "Layers", icon: Layers },
];

export const AServices: React.FC = () => {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");

  // Modal States for Category
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catIcon, setCatIcon] = useState("Wrench");
  const [catImage, setCatImage] = useState(IMG.cat_elec || "");
  const [catOrder, setCatOrder] = useState<number>(store.categories.length);

  // Modal States for Sub-Service
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string>(store.categories[0]?.id || "cat_ac");
  const [subName, setSubName] = useState("");
  const [subPrice, setSubPrice] = useState<number>(399);
  const [subDuration, setSubDuration] = useState<number>(45);
  const [subWarranty, setSubWarranty] = useState("30 Days Warranty");
  const [subImage, setSubImage] = useState("");
  const [subTrending, setSubTrending] = useState(false);
  
  // Inclusions & Addons builder
  const [inclusionInput, setInclusionInput] = useState("");
  const [inclusionsList, setInclusionsList] = useState<string[]>([
    "Complete fault inspection",
    "Labor & service guarantee",
  ]);
  const [exclusionInput, setExclusionInput] = useState("");
  const [exclusionsList, setExclusionsList] = useState<string[]>(["Spare parts cost if replaced"]);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState<number>(149);
  const [addonsList, setAddonsList] = useState<Addon[]>([]);

  // Open Add Category Modal
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName("");
    setCatDescription("");
    setCatIcon("Wrench");
    setCatImage(IMG.cat_ac || "");
    setCatOrder(store.categories.length);
    setCatModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
    setCatIcon(cat.icon || "Wrench");
    setCatImage(cat.image || "");
    setCatOrder(cat.order || 0);
    setCatModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = () => {
    if (!catName.trim()) {
      toast.error("Please enter a category / service name");
      return;
    }

    const catId = editingCatId || `cat_${catName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString().slice(-4)}`;
    const category: Category = {
      id: catId,
      name: catName.trim(),
      description: catDescription.trim(),
      icon: catIcon,
      image: catImage.trim() || IMG.cat_clean,
      order: Number(catOrder),
      is_active: true,
    };

    storeApi.adminSaveCategory(category);
    toast.success(editingCatId ? `Service "${category.name}" updated!` : `New Service "${category.name}" added!`);
    setCatModalOpen(false);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string, name: string) => {
    if (window.confirm(`Delete service "${name}" and all associated sub-services?`)) {
      storeApi.adminDeleteCategory(catId);
      toast.info(`Service "${name}" removed`);
    }
  };

  // Open Add Sub-Service Modal
  const handleOpenAddSubService = (catId?: string) => {
    setEditingSubId(null);
    setSubCategoryId(catId || (selectedCatFilter !== "all" ? selectedCatFilter : store.categories[0]?.id || "cat_ac"));
    setSubName("");
    setSubPrice(399);
    setSubDuration(45);
    setSubWarranty("30 Days Warranty");
    setSubImage("");
    setSubTrending(false);
    setInclusionsList(["Complete diagnosis & servicing", "Safety and operational check"]);
    setExclusionsList(["Major spare parts replacement cost"]);
    setAddonsList([]);
    setSubModalOpen(true);
  };

  // Open Edit Sub-Service Modal
  const handleOpenEditSubService = (sub: Service) => {
    setEditingSubId(sub.id);
    setSubCategoryId(sub.category_id);
    setSubName(sub.name);
    setSubPrice(sub.price);
    setSubDuration(sub.duration_min);
    setSubWarranty(sub.warranty || "30 Days Warranty");
    setSubImage(sub.image || "");
    setSubTrending(sub.trending);
    setInclusionsList(sub.inclusions || []);
    setExclusionsList(sub.exclusions || []);
    setAddonsList(sub.addons || []);
    setSubModalOpen(true);
  };

  // Save Sub-Service
  const handleSaveSubService = () => {
    if (!subName.trim()) {
      toast.error("Please enter sub-service name");
      return;
    }

    const subId = editingSubId || `serv_${subCategoryId.replace("cat_", "")}_${Date.now().toString().slice(-5)}`;
    const parentCat = store.categories.find((c) => c.id === subCategoryId);
    const service: Service = {
      id: subId,
      category_id: subCategoryId,
      name: subName.trim(),
      price: Number(subPrice),
      duration_min: Number(subDuration),
      rating: 4.8,
      reviews_count: 120,
      inclusions: inclusionsList,
      exclusions: exclusionsList,
      trending: subTrending,
      image: subImage.trim() || parentCat?.image || IMG.cat_ac,
      addons: addonsList,
      reviews: [{ name: "Verified Customer", rating: 5, text: "Excellent home service experience." }],
      warranty: subWarranty.trim(),
      is_active: true,
    };

    storeApi.adminSaveService(service);
    toast.success(editingSubId ? `Sub-service "${service.name}" updated!` : `New Sub-service "${service.name}" created!`);
    setSubModalOpen(false);
  };

  // Delete Sub-Service
  const handleDeleteSubService = (subId: string, name: string) => {
    if (window.confirm(`Delete sub-service "${name}"?`)) {
      storeApi.adminDeleteService(subId);
      toast.info(`Sub-service "${name}" deleted`);
    }
  };

  // Inclusions Helper
  const handleAddInclusion = () => {
    if (inclusionInput.trim()) {
      setInclusionsList([...inclusionsList, inclusionInput.trim()]);
      setInclusionInput("");
    }
  };

  // Exclusions Helper
  const handleAddExclusion = () => {
    if (exclusionInput.trim()) {
      setExclusionsList([...exclusionsList, exclusionInput.trim()]);
      setExclusionInput("");
    }
  };

  // Addon Helper
  const handleAddAddon = () => {
    if (addonName.trim()) {
      const newAddon: Addon = {
        id: `addon_${Date.now()}`,
        name: addonName.trim(),
        price: Number(addonPrice),
      };
      setAddonsList([...addonsList, newAddon]);
      setAddonName("");
      setAddonPrice(99);
    }
  };

  // Filtered Sub-Services
  const filteredSubServices = store.services.filter((s) => {
    const matchCat = selectedCatFilter === "all" || s.category_id === selectedCatFilter;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.categories.find((c) => c.id === s.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900">
            Services & Sub-Services Catalog
          </h2>
          <p className="text-xs text-slate-500">
            Naye service categories aur specific sub-services add karein, rates set karein, aur instant app me live karein
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddCategory}
            className="flex items-center gap-1.5 rounded-xl border border-[#1E3A8A] bg-white px-3.5 py-2 text-xs font-bold text-[#1E3A8A] hover:bg-blue-50 transition-colors shadow-2xs"
            data-testid="admin-add-category-btn"
          >
            <Plus className="h-4 w-4" /> Naya Service Category
          </button>
          <button
            onClick={() => handleOpenAddSubService()}
            className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#172554] active:scale-98 transition-all"
            data-testid="admin-add-subservice-btn"
          >
            <Plus className="h-4 w-4" /> Naya Sub-Service Jodein
          </button>
        </div>
      </div>

      {/* Tabs Switcher: Sub-Services vs Service Categories */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("services")}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === "services"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Sub-Services List ({store.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === "categories"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Main Service Categories ({store.categories.length})</span>
        </button>
      </div>

      {/* TAB 1: Sub-Services Management */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sub-service by name or keyword..."
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCatFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-colors ${
                  selectedCatFilter === "all"
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({store.services.length})
              </button>
              {store.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatFilter(cat.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedCatFilter === cat.id
                      ? "bg-[#1E3A8A] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name} ({store.services.filter((s) => s.category_id === cat.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubServices.map((sub) => {
              const cat = store.categories.find((c) => c.id === sub.category_id);
              const isActive = sub.is_active !== false;

              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border transition-all bg-white p-4 shadow-2xs flex flex-col justify-between ${
                    isActive ? "border-slate-200/90" : "border-slate-200 bg-slate-50/70 opacity-75"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={sub.image || cat?.image || IMG.cat_ac}
                          alt={sub.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[#1E3A8A] tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                            {cat?.name || "General Service"}
                          </span>
                          <h4 className="font-heading text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                            {sub.name}
                          </h4>
                        </div>
                      </div>

                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => {
                          storeApi.adminToggleServiceActive(sub.id);
                          toast.success(`"${sub.name}" status: ${isActive ? "PAUSED" : "ACTIVE"}`);
                        }}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                        title="Toggle Sub-Service Active/Inactive"
                      >
                        <Power className="h-2.5 w-2.5" />
                        <span>{isActive ? "Active" : "Off"}</span>
                      </button>
                    </div>

                    {/* Price and Details */}
                    <div className="mt-3 flex items-center justify-between border-y border-slate-100 py-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px]">Base Price</span>
                        <p className="font-extrabold text-[#1E3A8A] text-sm">{inr(sub.price)}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-400 text-[10px]">Duration</span>
                        <p className="font-bold text-slate-700 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {sub.duration_min}m
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[10px]">Warranty</span>
                        <p className="font-bold text-emerald-700 text-[11px]">{sub.warranty || "30 Days"}</p>
                      </div>
                    </div>

                    {/* Inclusions summary */}
                    <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                      <p className="font-semibold text-slate-700">Inclusions:</p>
                      {sub.inclusions.slice(0, 2).map((inc, i) => (
                        <p key={i} className="flex items-center gap-1 truncate text-slate-600">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0" /> {inc}
                        </p>
                      ))}
                      {sub.inclusions.length > 2 && (
                        <p className="text-[10px] text-slate-400">+{sub.inclusions.length - 2} more inclusions</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {sub.id}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditSubService(sub)}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Edit Sub-Service"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubService(sub.id, sub.name)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Delete Sub-Service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredSubServices.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
                <Tag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No sub-services found</p>
                <p className="text-xs text-slate-400 mt-1">Try another search keyword or create a new sub-service.</p>
                <button
                  onClick={() => handleOpenAddSubService()}
                  className="mt-3 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Create Sub-Service
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: City Availability Matrix (Har City me Saare Service Switch Toggle) */}
      {activeTab === "city_matrix" && (
        <div className="space-y-4" data-testid="city-availability-matrix-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <ToggleRight className="h-4 w-4 text-[#1E3A8A]" />
                <span>Har City me Saare Service Switch Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every service vs Every city switch toggles. Toggle individual services ON or OFF per city in real-time.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services in matrix..."
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 min-w-[200px]">Service & Category</th>
                    <th className="p-3.5 text-center">Base Price</th>
                    {store.cities.map((city) => (
                      <th key={city.id} className="p-3.5 text-center min-w-[130px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-extrabold text-slate-900 text-xs normal-case">{city.city_name}</span>
                          <span className="text-[9px] font-normal text-slate-400">({city.state})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const disabledCount = (city.disabled_service_ids || []).length;
                              const enableAll = disabledCount > 0;
                              storeApi.adminToggleAllCityServices(city.id, enableAll);
                              toast.success(
                                enableAll
                                  ? `All services enabled in ${city.city_name}`
                                  : `All services disabled in ${city.city_name}`
                              );
                            }}
                            className="text-[9px] font-bold text-[#1E3A8A] hover:underline"
                          >
                            Toggle All
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubServices.map((service) => {
                    const cat = store.categories.find((c) => c.id === service.category_id);
                    return (
                      <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="h-9 w-9 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{service.name}</p>
                              <p className="text-[10px] text-[#1E3A8A] font-semibold">{cat?.name || "Service"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-extrabold text-slate-700">
                          {inr(service.price)}
                        </td>
                        {store.cities.map((city) => {
                          const isActiveInCity = !(city.disabled_service_ids || []).includes(service.id);
                          return (
                            <td key={city.id} className="p-3.5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    storeApi.adminToggleCityService(city.id, service.id, !isActiveInCity);
                                    toast.success(
                                      `"${service.name}" is now ${!isActiveInCity ? "ACTIVE" : "PAUSED"} in ${city.city_name}`
                                    );
                                  }}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isActiveInCity ? "bg-[#22C55E]" : "bg-slate-300"
                                  }`}
                                  role="switch"
                                  aria-checked={isActiveInCity}
                                  data-testid={`matrix-toggle-${city.id}-${service.id}`}
                                  title={`Toggle ${service.name} in ${city.city_name}`}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isActiveInCity ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[9px] font-extrabold uppercase ${
                                    isActiveInCity ? "text-emerald-700" : "text-slate-400"
                                  }`}
                                >
                                  {isActiveInCity ? "ON" : "OFF"}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Main Service Categories Management */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {store.categories.map((cat) => {
              const subCount = store.services.filter((s) => s.category_id === cat.id).length;
              const isActive = cat.is_active !== false;

              return (
                <div
                  key={cat.id}
                  className={`rounded-2xl border bg-white p-4 shadow-2xs flex flex-col justify-between ${
                    isActive ? "border-slate-200/90" : "border-slate-200 bg-slate-50/70 opacity-75"
                  }`}
                >
                  <div>
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3">
                      <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                        <span className="font-heading font-extrabold text-sm text-white drop-shadow">
                          {cat.name}
                        </span>
                        <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-bold">
                          {subCount} items
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {cat.description || `Certified professional ${cat.name.toLowerCase()} services at doorstep.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {/* Toggle Active */}
                    <button
                      onClick={() => {
                        storeApi.adminToggleCategoryActive(cat.id);
                        toast.success(`Category "${cat.name}" status: ${isActive ? "PAUSED" : "ACTIVE"}`);
                      }}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                        isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <Power className="h-2.5 w-2.5" />
                      <span>{isActive ? "Active" : "Off"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddSubService(cat.id)}
                        className="rounded-lg p-1 text-[#1E3A8A] hover:bg-blue-50 text-[10px] font-bold flex items-center gap-0.5"
                        title="Add sub-service to this category"
                      >
                        <Plus className="h-3 w-3" /> Sub
                      </button>
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                        title="Edit Category"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal 1: Add / Edit Main Service Category */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="max-w-md" onClose={() => setCatModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingCatId ? "Edit Service Category" : "Add New Main Service Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Service / Category Name</label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Solar Panel Cleaning, Carpentry, Salon"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <Input
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Brief description for customer catalog"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Image URL</label>
              <Input
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                placeholder="https://..."
              />
              <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                {Object.entries(IMG).map(([k, url]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCatImage(url)}
                    className={`h-10 w-10 shrink-0 rounded-lg overflow-hidden border-2 ${catImage === url ? "border-[#1E3A8A]" : "border-transparent"}`}
                  >
                    <img src={url} alt={k} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveCategory}
              className="mt-4 w-full rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#172554]"
            >
              {editingCatId ? "Update Category" : "Save Service Category"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Add / Edit Sub-Service */}
      <Dialog open={subModalOpen} onOpenChange={setSubModalOpen}>
        <DialogContent className="max-w-lg" onClose={() => setSubModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingSubId ? "Edit Sub-Service" : "Add New Sub-Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 pt-1 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Category Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Parent Category</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#1E3A8A]"
              >
                {store.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Service Name */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sub-Service Name</label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Split AC Deep Jet Wash, Kitchen Drain Unclogging"
              />
            </div>

            {/* Price, Duration & Warranty */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Price (₹)</label>
                <Input
                  type="number"
                  value={subPrice}
                  onChange={(e) => setSubPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Duration (min)</label>
                <Input
                  type="number"
                  value={subDuration}
                  onChange={(e) => setSubDuration(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warranty</label>
                <Input
                  value={subWarranty}
                  onChange={(e) => setSubWarranty(e.target.value)}
                  placeholder="30 Days"
                />
              </div>
            </div>

            {/* Inclusions List Builder */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <label className="font-bold text-slate-800 block">Service Inclusions (What's Included)</label>
              <div className="flex gap-2">
                <Input
                  value={inclusionInput}
                  onChange={(e) => setInclusionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInclusion())}
                  placeholder="Add item, e.g. High-pressure jet pump wash"
                  className="bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-white font-bold"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1 max-h-24 overflow-y-auto">
                {inclusionsList.map((inc, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Check className="h-3 w-3 text-emerald-600" /> {inc}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInclusionsList(inclusionsList.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-on Items Builder */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <label className="font-bold text-slate-800 block">Optional Add-ons / Spare Parts</label>
              <div className="flex gap-2">
                <Input
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder="Add-on item name"
                  className="bg-white flex-1"
                />
                <Input
                  type="number"
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(Number(e.target.value))}
                  placeholder="₹"
                  className="bg-white w-20"
                />
                <button
                  type="button"
                  onClick={handleAddAddon}
                  className="rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-white font-bold"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1">
                {addonsList.map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
                    <span className="text-slate-700">{a.name} ({inr(a.price)})</span>
                    <button
                      type="button"
                      onClick={() => setAddonsList(addonsList.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <span className="font-bold text-slate-800">Highlight as Trending</span>
                <p className="text-[10px] text-slate-400">Shows trending badge on customer home screen</p>
              </div>
              <input
                type="checkbox"
                checked={subTrending}
                onChange={(e) => setSubTrending(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1E3A8A] cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveSubService}
              className="mt-4 w-full rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#172554]"
            >
              {editingSubId ? "Update Sub-Service" : "Save & Publish Sub-Service"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
