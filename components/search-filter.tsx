"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Filter, X, Save, Download, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BuildDrone } from "@/lib/types"

// Filter types
export interface FilterState {
  search: string
  status: string[]
  systems: string[]
  assemblies: string[]
  completionRange: [number, number]
  dateRange: {
    start: string
    end: string
  }
}

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: FilterState
}

// Default filter state
const defaultFilters: FilterState = {
  search: '',
  status: [],
  systems: [],
  assemblies: [],
  completionRange: [0, 100],
  dateRange: {
    start: '',
    end: ''
  }
}

// Predefined filter presets
const defaultPresets: FilterPreset[] = [
  {
    id: 'in-progress',
    name: 'In Progress',
    description: 'Drones currently being built',
    filters: {
      ...defaultFilters,
      status: ['in-progress']
    }
  },
  {
    id: 'near-completion',
    name: 'Near Completion',
    description: 'Drones over 80% complete',
    filters: {
      ...defaultFilters,
      completionRange: [80, 100]
    }
  },
  {
    id: 'avionics-focus',
    name: 'Avionics Focus',
    description: 'Drones with avionics system selected',
    filters: {
      ...defaultFilters,
      systems: ['Avionics']
    }
  }
]

interface SearchFilterProps {
  data: BuildDrone[]
  onFilterChange: (filteredData: BuildDrone[]) => void
  onExport?: (format: 'csv' | 'json') => void
  className?: string
}

export function SearchFilter({ data, onFilterChange, onExport, className }: SearchFilterProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [presets, setPresets] = useState<FilterPreset[]>(defaultPresets)
  const [showFilters, setShowFilters] = useState(false)
  const [savePresetName, setSavePresetName] = useState('')
  
  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const statuses = new Set<string>()
    const systems = new Set<string>()
    const assemblies = new Set<string>()
    
    data.forEach(drone => {
      statuses.add(drone.status)
      drone.systems?.forEach(system => {
        systems.add(system.name)
        system.assemblies?.forEach(assembly => {
          assemblies.add(assembly.name)
        })
      })
    })
    
    return {
      statuses: Array.from(statuses),
      systems: Array.from(systems),
      assemblies: Array.from(assemblies)
    }
  }, [data])
  
  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter(drone => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          drone.serial.toLowerCase().includes(searchLower) ||
          drone.model.toLowerCase().includes(searchLower) ||
          drone.systems?.some(system => 
            system.name.toLowerCase().includes(searchLower) ||
            system.assemblies?.some(assembly =>
              assembly.name.toLowerCase().includes(searchLower) ||
              assembly.items?.some(item =>
                item.name.toLowerCase().includes(searchLower)
              )
            )
          )
        
        if (!matchesSearch) return false
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(drone.status)) {
        return false
      }
      
      // System filter
      if (filters.systems.length > 0) {
        const hasMatchingSystem = drone.systems?.some(system =>
          filters.systems.includes(system.name)
        )
        if (!hasMatchingSystem) return false
      }
      
      // Assembly filter
      if (filters.assemblies.length > 0) {
        const hasMatchingAssembly = drone.systems?.some(system =>
          system.assemblies?.some(assembly =>
            filters.assemblies.includes(assembly.name)
          )
        )
        if (!hasMatchingAssembly) return false
      }
      
      // Completion range filter
      if (drone.overallCompletion < filters.completionRange[0] ||
          drone.overallCompletion > filters.completionRange[1]) {
        return false
      }
      
      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const startDate = drone.startDate ? new Date(drone.startDate) : null
        if (filters.dateRange.start && (!startDate || startDate < new Date(filters.dateRange.start))) {
          return false
        }
        if (filters.dateRange.end && (!startDate || startDate > new Date(filters.dateRange.end))) {
          return false
        }
      }
      
      return true
    })
  }, [data, filters])
  
  // Update parent component when filtered data changes
  React.useEffect(() => {
    onFilterChange(filteredData)
  }, [filteredData, onFilterChange])
  
  const updateFilter = useCallback((key: keyof FilterState, value: string | string[] | [number, number] | { start: string; end: string }) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])
  
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])
  
  const applyPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters)
  }, [])
  
  const saveCurrentAsPreset = useCallback(() => {
    if (!savePresetName.trim()) return
    
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: savePresetName.trim(),
      filters: { ...filters }
    }
    
    setPresets(prev => [...prev, newPreset])
    setSavePresetName('')
  }, [savePresetName, filters])
  
  const removePreset = useCallback((presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId))
  }, [])
  
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.status.length > 0) count++
    if (filters.systems.length > 0) count++
    if (filters.assemblies.length > 0) count++
    if (filters.completionRange[0] > 0 || filters.completionRange[1] < 100) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }, [filters])
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar and Quick Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drones, systems, assemblies, or items..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <div className="flex gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 min-w-[20px] h-5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                filterOptions={filterOptions}
                onClear={clearFilters}
              />
            </PopoverContent>
          </Popover>
          
          {onExport && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onExport('csv')}
                  >
                    Export as CSV
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onExport('json')}
                  >
                    Export as JSON
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      {/* Filter Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(preset => (
          <div key={preset.id} className="relative group">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 pr-6"
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
            </Badge>
            {!['in-progress', 'near-completion', 'avionics-focus'].includes(preset.id) && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                onClick={(e) => {
                  e.stopPropagation()
                  removePreset(preset.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-3 w-3 mr-1" />
              Save Current
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="Enter preset name..."
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
              />
              <Button
                onClick={saveCurrentAsPreset}
                disabled={!savePresetName.trim()}
                className="w-full"
              >
                Save Preset
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="text-xs">
              Status: {status}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => updateFilter('status', filters.status.filter(s => s !== status))}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {filters.systems.map(system => (
            <Badge key={system} variant="secondary" className="text-xs">
              System: {system}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => updateFilter('systems', filters.systems.filter(s => s !== system))}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          
          {(filters.completionRange[0] > 0 || filters.completionRange[1] < 100) && (
            <Badge variant="secondary" className="text-xs">
              Completion: {filters.completionRange[0]}%-{filters.completionRange[1]}%
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => updateFilter('completionRange', [0, 100])}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      )}
      
      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} drones
      </div>
    </div>
  )
}

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string | string[] | [number, number] | { start: string; end: string }) => void
  filterOptions: {
    statuses: string[]
    systems: string[]
    assemblies: string[]
  }
  onClear: () => void
}

function FilterPanel({ filters, onFilterChange, filterOptions, onClear }: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </div>
      
      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Status</Label>
        <div className="space-y-1">
          {filterOptions.statuses.map(status => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status.includes(status)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange('status', [...filters.status, status])
                  } else {
                    onFilterChange('status', filters.status.filter(s => s !== status))
                  }
                }}
              />
              <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                {status.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Systems Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Systems</Label>
        <div className="space-y-1">
          {filterOptions.systems.map(system => (
            <div key={system} className="flex items-center space-x-2">
              <Checkbox
                id={`system-${system}`}
                checked={filters.systems.includes(system)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange('systems', [...filters.systems, system])
                  } else {
                    onFilterChange('systems', filters.systems.filter(s => s !== system))
                  }
                }}
              />
              <Label htmlFor={`system-${system}`} className="text-sm">
                {system}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Completion Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Completion Range: {filters.completionRange[0]}% - {filters.completionRange[1]}%
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={filters.completionRange[0]}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                onFilterChange('completionRange', [value, filters.completionRange[1]])
              }}
              className="w-20"
            />
            <span className="text-sm">to</span>
            <Input
              type="number"
              min="0"
              max="100"
              value={filters.completionRange[1]}
              onChange={(e) => {
                const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 100))
                onFilterChange('completionRange', [filters.completionRange[0], value])
              }}
              className="w-20"
            />
          </div>
        </div>
      </div>
      
      {/* Date Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Start Date Range</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => {
                onFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: e.target.value
                })
              }}
              className="flex-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => {
                onFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: e.target.value
                })
              }}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
