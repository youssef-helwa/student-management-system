// // import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// // import * as branchService from '../services/branchService';
// // import { useAuth } from './AuthContext';
// // import { canAccessBranch } from '../utils/permissions';

// // const BranchContext = createContext(null);

// // export function BranchProvider({ children }) {
// //   const { user } = useAuth();
// //   const [branches, setBranches] = useState([]);
// //   const [activeBranch, setActiveBranchState] = useState(() => {
// //     const cached = sessionStorage.getItem('sms_branch');
// //     return cached ? JSON.parse(cached) : null;
// //   });
// //   const [loading, setLoading] = useState(true);

// //   // Treat a missing/empty response the same as zero branches (e.g. right
// //   // after the first Administrator is created, before any branch has been
// //   // added) instead of crashing on .filter/.map.
// //   async function refreshBranches() {
// //   try {
// //     const data = await branchService.getBranches();

// //     console.log("========== BRANCHES RESPONSE ==========");
// //     console.log("DATA:", data);
// //     console.log("IS ARRAY:", Array.isArray(data));
// //     console.log("========================================");

// //     setBranches(Array.isArray(data) ? data : []);
// //   } catch (error) {
// //     console.error("========== GET BRANCHES ERROR ==========");
// //     console.error("ERROR:", error);
// //     console.error("MESSAGE:", error?.message);
// //     console.error("STATUS:", error?.status);
// //     console.error("DATA:", error?.data);
// //     console.error("=========================================");

// //     setBranches([]);
// //   }
// // }

// //   useEffect(() => {
// //     if (!user) {
// //         setBranches([]);
// //         setLoading(false);
// //         return;
// //     }

// //     setLoading(true);

// //     refreshBranches().finally(() => {
// //         setLoading(false);
// //     });
// //   }, [user]);

// //   function setActiveBranch(branch) {
// //     setActiveBranchState(branch);
// //     sessionStorage.setItem('sms_branch', JSON.stringify(branch));
// //   }

// //   const value = useMemo(
// //     () => ({ branches, accessibleBranches, activeBranch, setActiveBranch, refreshBranches, loading }),
// //     [branches, accessibleBranches, activeBranch, loading]
// //   );

// //   return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
// // }

// // export function useBranch() {
// //   const ctx = useContext(BranchContext);
// //   if (!ctx) throw new Error('useBranch must be used within BranchProvider');
// //   return ctx;
// // }



// import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import * as branchService from '../services/branchService';
// import { useAuth } from './AuthContext';
// import { canAccessBranch } from '../utils/permissions';


// const BranchContext = createContext(null);

// export function BranchProvider({ children }) {
//     const { user } = useAuth();

//     const [branches, setBranches] = useState([]);

//     const [activeBranch, setActiveBranchState] = useState(() => {
//         const cached = sessionStorage.getItem('sms_branch');
//         return cached ? JSON.parse(cached) : null;
//     });

//     const [loading, setLoading] = useState(true);

//     async function refreshBranches() {
//         try {
//             const data = await branchService.getBranches();
//             setBranches(Array.isArray(data) ? data : []);
//         } catch (error) {
//             console.error('GET BRANCHES ERROR:', error);
//             setBranches([]);
//         }
//     }

//     useEffect(() => {
//         if (!user) {
//             setBranches([]);
//             setLoading(false);
//             return;
//         }

//         setLoading(true);

//         refreshBranches().finally(() => {
//             setLoading(false);
//         });
//     }, [user]);

//     // THIS WAS MISSING
//     const accessibleBranches = useMemo(
//         () => branches.filter((b) => canAccessBranch(user, b.id)),
//         [branches, user]
//     );

//     function setActiveBranch(branch) {
//         setActiveBranchState(branch);
//         sessionStorage.setItem('sms_branch', JSON.stringify(branch));
//     }

//     const value = useMemo(
//         () => ({
//             branches,
//             accessibleBranches,
//             activeBranch,
//             setActiveBranch,
//             refreshBranches,
//             loading
//         }),
//         [branches, accessibleBranches, activeBranch, loading]
//     );

//     return (
//         <BranchContext.Provider value={value}>
//             {children}
//         </BranchContext.Provider>
//     );
// }

// export function useBranch() {
//     const ctx = useContext(BranchContext);

//     if (!ctx) {
//         throw new Error('useBranch must be used within BranchProvider');
//     }

//     return ctx;
// }




import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import * as branchService from '../services/branchService';
import { useAuth } from './AuthContext';
import { canAccessBranch } from '../utils/permissions';

const BranchContext = createContext(null);

export function BranchProvider({ children }) {
  const { user } = useAuth();

  const [branches, setBranches] = useState([]);

  const [activeBranch, setActiveBranchState] = useState(() => {
    try {
      const cached = sessionStorage.getItem('sms_branch');
      return cached ? JSON.parse(cached) : null;
    } catch {
      sessionStorage.removeItem('sms_branch');
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  async function refreshBranches() {
    try {
      const response = await branchService.getBranches();

      // API returns { message, data: [...] }
      const branchesData = Array.isArray(response)
        ? response
        : response?.data || [];

      setBranches(branchesData);

      return branchesData;
    } catch (error) {
      console.error('GET BRANCHES ERROR:', error);
      setBranches([]);
      throw error;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initializeBranches() {
      if (!user) {
        setBranches([]);
        setActiveBranchState(null);
        sessionStorage.removeItem('sms_branch');
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await refreshBranches();

        if (cancelled) return;

        const accessible = data.filter(branch =>
          canAccessBranch(user, branch.id)
        );

        const cachedId = activeBranch?.id;
        const userBranchId = user?.branchId;

        // Keep the previous selection if it is still accessible.
        const selectedBranch =
          accessible.find(b => String(b.id) === String(cachedId)) ||
          accessible.find(b => String(b.id) === String(userBranchId)) ||
          accessible[0] ||
          null;

        setActiveBranchState(selectedBranch);

        if (selectedBranch) {
          sessionStorage.setItem(
            'sms_branch',
            JSON.stringify(selectedBranch)
          );
        } else {
          sessionStorage.removeItem('sms_branch');
        }

      } catch (error) {
        console.error('Could not initialize branches:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializeBranches();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const accessibleBranches = useMemo(() => {
    return branches.filter(branch =>
      canAccessBranch(user, branch.id)
    );
  }, [branches, user]);

  function setActiveBranch(branch) {
    setActiveBranchState(branch);

    if (branch) {
      sessionStorage.setItem(
        'sms_branch',
        JSON.stringify(branch)
      );
    } else {
      sessionStorage.removeItem('sms_branch');
    }
  }

  const value = useMemo(() => ({
    branches,
    accessibleBranches,
    activeBranch,
    setActiveBranch,
    refreshBranches,
    loading
  }), [branches, accessibleBranches, activeBranch, loading]);

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);

  if (!ctx) {
    throw new Error('useBranch must be used within BranchProvider');
  }

  return ctx;
}
