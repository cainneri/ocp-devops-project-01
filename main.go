package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"
)

type Account struct {
	ID               string         `json:"id"`
	Name             string         `json:"name"`
	EligibleClusters int            `json:"eligibleClusters"`
	SubStatus        string         `json:"subStatus"`
	Team             Team           `json:"team"`
	Support          SupportMetrics `json:"support"`
	GraphData        GraphData      `json:"graphData"`
}

type Team struct {
	TAM  string `json:"tam"`
	APAC string `json:"apac"`
	IST  string `json:"ist"`
	EMEA string `json:"emea"`
	EST  string `json:"est"`
}

type Case struct {
	CaseID   string `json:"caseId"`
	Severity string `json:"severity"`
	Status   string `json:"status"`
	Subject  string `json:"subject"`
}

type SupportMetrics struct {
	ActiveCases      []Case `json:"activeCases"`
	HighSevCount     int    `json:"highSevCount"`
	Escalations      int    `json:"escalations"`
	AwaitingCustomer int    `json:"awaitingCustomer"`
	WaitingOnEng     int    `json:"waitingOnEng"`
}

type GraphData struct {
	Sev1 int `json:"sev1"`
	Sev2 int `json:"sev2"`
	Sev3 int `json:"sev3"`
	Sev4 int `json:"sev4"`
}

type Cluster struct {
	ID         string      `json:"id"`
	Name       string      `json:"name"`
	Version    string      `json:"version"`
	Infra      string      `json:"infra"`
	SubStatus  string      `json:"subStatus"`
	Health     HealthCheck `json:"health"`
	Nodes      []Node      `json:"nodes"`
	Cases      []Case      `json:"cases"`
	InflowData []int       `json:"inflowData"`
}

type HealthCheck struct {
	EtcdBackup     bool `json:"etcdBackup"`
	SystemdReserve bool `json:"systemdReserve"`
	NTPSync        bool `json:"ntpSync"`
	KdumpCheck     bool `json:"kdumpCheck"`
}

type Node struct {
	Name string `json:"name"`
	Role string `json:"role"`
}

func main() {
	rand.Seed(time.Now().UnixNano())
	
	http.HandleFunc("/api/accounts", accountsHandler)
	http.HandleFunc("/api/clusters", clustersHandler)

	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	port := ":8080"
	log.Printf("Starting server on http://localhost%s", port)
	
	server := &http.Server{
		Addr:         port,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Could not listen on %s: %v\n", port, err)
	}
}

func accountsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	accounts := []Account{
		{
			ID:               "kamal",
			Name:             "Kamal Bank",
			EligibleClusters: 25,
			SubStatus:        "Active",
			Team:             Team{TAM: "Robert Taylor", APAC: "Akira S.", IST: "Vikram S.", EMEA: "Hans W.", EST: "Maria G."},
			Support: SupportMetrics{
				HighSevCount:     2,
				Escalations:      4,
				AwaitingCustomer: 2,
				WaitingOnEng:     3,
				ActiveCases: []Case{
					{"3029411", "High", "In Progress", "API server unresponsive"},
					{"3029412", "High", "Investigating", "Etcd quorum lost"},
					{"3029413", "Medium", "In Progress", "SDN packet drops"},
					{"3029414", "Medium", "Waiting on Customer", "High CPU on worker nodes"},
					{"3029415", "Low", "Open", "Registry pull failures"},
				},
			},
			GraphData: GraphData{Sev1: 3, Sev2: 8, Sev3: 20, Sev4: 10},
		},
		{
			ID:               "dracan",
			Name:             "Dracan Space Tech",
			EligibleClusters: 15,
			SubStatus:        "Active",
			Team:             Team{TAM: "Sarah Smith", APAC: "Michael C.", IST: "Rajiv K.", EMEA: "Liam O.", EST: "Emily D."},
			Support: SupportMetrics{
				HighSevCount:     3,
				Escalations:      1,
				AwaitingCustomer: 5,
				WaitingOnEng:     1,
				ActiveCases: []Case{
					{"1029432", "High", "In Progress", "Cluster panic on node scale"},
					{"1029433", "Medium", "Waiting on Customer", "Network ingress latency"},
				},
			},
			GraphData: GraphData{Sev1: 1, Sev2: 4, Sev3: 12, Sev4: 8},
		},
		{
			ID:               "snape",
			Name:             "Snape Research",
			EligibleClusters: 10,
			SubStatus:        "Active",
			Team:             Team{TAM: "Severus P.", APAC: "Cho C.", IST: "Padma P.", EMEA: "Minerva M.", EST: "Filius F."},
			Support: SupportMetrics{
				HighSevCount:     1,
				Escalations:      0,
				AwaitingCustomer: 2,
				WaitingOnEng:     1,
				ActiveCases: []Case{
					{"4029101", "High", "Investigating", "Image registry connection timeout"},
					{"4029102", "Medium", "Waiting on Customer", "Custom operator failing to reconcile"},
				},
			},
			GraphData: GraphData{Sev1: 1, Sev2: 2, Sev3: 5, Sev4: 4},
		},
		{
			ID:               "rajini",
			Name:             "Rajini Motors",
			EligibleClusters: 10,
			SubStatus:        "Active",
			Team:             Team{TAM: "Muthu V.", APAC: "Siva K.", IST: "Ramesh B.", EMEA: "Basha A.", EST: "Chitti R."},
			Support: SupportMetrics{
				HighSevCount:     0,
				Escalations:      0,
				AwaitingCustomer: 4,
				WaitingOnEng:     0,
				ActiveCases: []Case{
					{"5029201", "Low", "In Progress", "Log forwarding to Splunk drops events"},
					{"5029202", "Medium", "Waiting on Customer", "MachineConfigPool degraded"},
					{"5029203", "Low", "Open", "Documentation query on ingress VIP"},
				},
			},
			GraphData: GraphData{Sev1: 0, Sev2: 2, Sev3: 6, Sev4: 15},
		},
		{
			ID:               "randomai",
			Name:             "Random AI Company",
			EligibleClusters: 10,
			SubStatus:        "Active",
			Team:             Team{TAM: "Alan T.", APAC: "Ada L.", IST: "Yann L.", EMEA: "Geoffrey H.", EST: "Yoshua B."},
			Support: SupportMetrics{
				HighSevCount:     4,
				Escalations:      2,
				AwaitingCustomer: 1,
				WaitingOnEng:     6,
				ActiveCases: []Case{
					{"6029301", "High", "In Progress", "GPU node autoscaler panic"},
					{"6029302", "High", "Waiting on Eng", "NVIDIA device plugin crashloop"},
					{"6029303", "Medium", "In Progress", "High latency in pod-to-pod CNI"},
					{"6029304", "Medium", "Waiting on Eng", "Scheduler latency with 10k pods"},
				},
			},
			GraphData: GraphData{Sev1: 4, Sev2: 12, Sev3: 8, Sev4: 2},
		},
	}
	json.NewEncoder(w).Encode(accounts)
}

func clustersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	accountID := r.URL.Query().Get("accountID")
	
	var clusters []Cluster
	count := 50
	prefix := "cluster"
	
	switch accountID {
	case "kamal":
		count = 258
		prefix = "kamalbankcluster"
	case "dracan":
		count = 15
		prefix = "dracancluster"
	case "snape":
		count = 10
		prefix = "snapecluster"
	case "rajini":
		count = 10
		prefix = "rajinicluster"
	case "randomai":
		count = 10
		prefix = "randomaicluster"
	}

	ocpVersions := []string{"4.10.40", "4.12.20", "4.14.8", "4.15.3", "4.16.0"}

	for i := 1; i <= count; i++ {
		clusterName := fmt.Sprintf("%s-%02d", prefix, i)
		assignedVersion := ocpVersions[i%len(ocpVersions)]
		
		var nodes []Node
		for m := 1; m <= 3; m++ {
			nodes = append(nodes, Node{Name: fmt.Sprintf("%s-master-%02d", clusterName, m), Role: "Master"})
		}
		for in := 1; in <= 3; in++ {
			nodes = append(nodes, Node{Name: fmt.Sprintf("%s-infra-%02d", clusterName, in), Role: "Infra"})
		}
		for wk := 1; wk <= 4; wk++ {
			nodes = append(nodes, Node{Name: fmt.Sprintf("%s-worker-%02d", clusterName, wk), Role: "Worker"})
		}

		var cases []Case
		if i%3 == 0 {
			cases = append(cases, Case{CaseID: fmt.Sprintf("CL-10%d", i), Severity: "High", Status: "In Progress", Subject: "Node NotReady state"})
		}
		if i%5 == 0 {
			cases = append(cases, Case{CaseID: fmt.Sprintf("CL-20%d", i), Severity: "Medium", Status: "Waiting on Customer", Subject: "Storage PVC expansion failing"})
		}

		inflow := []int{rand.Intn(5), rand.Intn(8), rand.Intn(3), rand.Intn(10), rand.Intn(4), rand.Intn(6), rand.Intn(5)}

		clusters = append(clusters, Cluster{
			ID:         fmt.Sprintf("c-%s-%d", accountID, i),
			Name:       clusterName,
			Version:    assignedVersion,
			Infra:      "Baremetal",
			SubStatus:  "Valid",
			Health: HealthCheck{
				EtcdBackup:     true,
				SystemdReserve: false,
				NTPSync:        true,
				KdumpCheck:     true,
			},
			Nodes:      nodes,
			Cases:      cases,
			InflowData: inflow,
		})
	}

	json.NewEncoder(w).Encode(clusters)
}
