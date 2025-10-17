import { useCallback, useRef, useState } from 'react';

// Enhanced lazy loading with preload capability
export const createPreloadableLazy = (importFunc) => {
  let componentImport = null;
  
  const LazyComponent = React.lazy(() => {
    if (!componentImport) {
      componentImport = importFunc();
    }
    return componentImport;
  });
  
  // Add preload method to the lazy component
  LazyComponent.preload = () => {
    if (!componentImport) {
      componentImport = importFunc();
    }
    return componentImport;
  };
  
  return LazyComponent;
};

// Hook for managing component preloading
export const useComponentPreloader = () => {
  const preloadTimeouts = useRef(new Map());
  const [preloadedComponents, setPreloadedComponents] = useState(new Set());
  
  const preloadComponent = useCallback((componentName, preloadFunc, delay = 100) => {
    // Clear existing timeout for this component
    if (preloadTimeouts.current.has(componentName)) {
      clearTimeout(preloadTimeouts.current.get(componentName));
    }
    
    // Set new timeout for preloading
    const timeout = setTimeout(async () => {
      try {
        console.log(`🚀 Preloading component: ${componentName}`);
        await preloadFunc();
        setPreloadedComponents(prev => new Set(prev).add(componentName));
        console.log(`✅ Component preloaded: ${componentName}`);
      } catch (error) {
        console.warn(`❌ Failed to preload component ${componentName}:`, error);
      }
    }, delay);
    
    preloadTimeouts.current.set(componentName, timeout);
  }, []);
  
  const cancelPreload = useCallback((componentName) => {
    if (preloadTimeouts.current.has(componentName)) {
      clearTimeout(preloadTimeouts.current.get(componentName));
      preloadTimeouts.current.delete(componentName);
    }
  }, []);
  
  const isPreloaded = useCallback((componentName) => {
    return preloadedComponents.has(componentName);
  }, [preloadedComponents]);
  
  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    preloadTimeouts.current.forEach(timeout => clearTimeout(timeout));
    preloadTimeouts.current.clear();
  }, []);
  
  return {
    preloadComponent,
    cancelPreload,
    isPreloaded,
    cleanup,
    preloadedComponents
  };
};

// Hook for data prefetching
export const useDataPrefetcher = () => {
  const prefetchTimeouts = useRef(new Map());
  const [prefetchedData, setPrefetchedData] = useState(new Map());
  const [prefetchStatus, setPrefetchStatus] = useState(new Map()); // 'loading', 'success', 'error'
  
  const prefetchData = useCallback((key, fetchFunc, delay = 150) => {
    // Skip if already prefetched or currently loading
    if (prefetchedData.has(key) || prefetchStatus.get(key) === 'loading') {
      return;
    }
    
    // Clear existing timeout
    if (prefetchTimeouts.current.has(key)) {
      clearTimeout(prefetchTimeouts.current.get(key));
    }
    
    const timeout = setTimeout(async () => {
      try {
        console.log(`📡 Prefetching data: ${key}`);
        setPrefetchStatus(prev => new Map(prev).set(key, 'loading'));
        
        const data = await fetchFunc();
        
        setPrefetchedData(prev => new Map(prev).set(key, data));
        setPrefetchStatus(prev => new Map(prev).set(key, 'success'));
        console.log(`✅ Data prefetched: ${key}`);
      } catch (error) {
        console.warn(`❌ Failed to prefetch data ${key}:`, error);
        setPrefetchStatus(prev => new Map(prev).set(key, 'error'));
      }
    }, delay);
    
    prefetchTimeouts.current.set(key, timeout);
  }, [prefetchedData, prefetchStatus]);
  
  const cancelPrefetch = useCallback((key) => {
    if (prefetchTimeouts.current.has(key)) {
      clearTimeout(prefetchTimeouts.current.get(key));
      prefetchTimeouts.current.delete(key);
    }
  }, []);
  
  const getPrefetchedData = useCallback((key) => {
    return prefetchedData.get(key);
  }, [prefetchedData]);
  
  const getPrefetchStatus = useCallback((key) => {
    return prefetchStatus.get(key) || 'idle';
  }, [prefetchStatus]);
  
  const isPrefetched = useCallback((key) => {
    return prefetchedData.has(key);
  }, [prefetchedData]);
  
  const cleanup = useCallback(() => {
    prefetchTimeouts.current.forEach(timeout => clearTimeout(timeout));
    prefetchTimeouts.current.clear();
  }, []);
  
  return {
    prefetchData,
    cancelPrefetch,
    getPrefetchedData,
    getPrefetchStatus,
    isPrefetched,
    cleanup
  };
};

export default { createPreloadableLazy, useComponentPreloader, useDataPrefetcher };
