terraform {
  required_providers {
    mws = {
      source = "mws-cloud/mws"
    }
  }
  required_version = ">= 1.0"
}

variable "MWS_TOKEN" {
  description = "MWS Cloud IAM token"
  type        = string
  sensitive   = true
}

provider "mws" {
  mws_token = var.MWS_TOKEN
  project   = "teamfinder-prj"
  zone      = "ru-central1-a"
}

resource "mws_vpc_network" "network" {
  network = "teamfinder-net"
}

resource "mws_vpc_subnet" "subnet" {
  subnet  = "teamfinder-subnet"
  network = mws_vpc_network.network.network 
  cidr    = "192.168.0.0/16"
}

data "mws_compute_image" "image" {
  image   = "mws-ubuntu-2204-lts-v20250529"
  project = "mws-ubuntu"
}

resource "mws_vpc_address" "vm_primary_network_interface_address" {
  network = mws_vpc_network.network.network
  subnet  = mws_vpc_subnet.subnet.metadata.id
  address = "teamfinder-vm-primary-network-interface-address"
}

resource "mws_vpc_external_address" "vm_external_address" {
  external_address = "teamfinder-vm-external-address"
}

resource "mws_compute_disk" "disk" {
  disk      = "teamfinder-vm-disk"
  disk_type = "diskTypes/nbs-pl2"
  iops      = 1000
  size      = "10GB"
  source = {
    image = data.mws_compute_image.image.metadata.id
  }
}

variable "SSH_PUBLIC_KEY" {
  description = "Public SSH key for VM admin user"
  type        = string
  sensitive   = true
}

resource "mws_compute_virtual_machine" "vm" {
  virtual_machine = "teamfinder-vm"
  vm_type         = "vmTypes/gen-2-8"

  hardware = {
    power                     = "ON"
    graceful_shutdown_timeout = "1m 30s"
  }

  os = {
    hostname = "teamfinder"

    metadata = {
      attributes = {
        user-data = <<-EOF
          #cloud-config
          users:
            - name: teamfinder
              groups: sudo
              shell: /bin/bash
              sudo: "ALL=(ALL) NOPASSWD:ALL"
              ssh_authorized_keys:
                - ${var.SSH_PUBLIC_KEY}

          ssh_pwauth: false
        EOF
      }
    }
  }

  storage = {
    disks = [
      {
        name = "boot"
        boot = true
        disk = {
          ref = mws_compute_disk.disk.metadata.id
        }
      }
    ]
  }

  network = {
    network_interfaces = [
      {
        name    = "teamfinder-vm-network-interface-primary"
        primary = true
        addresses = [
          {
            address = {
              ref = mws_vpc_address.vm_primary_network_interface_address.metadata.id
            }
            one_to_one_nat = {
              external = {
                address = {
                  ref = mws_vpc_external_address.vm_external_address.metadata.id
                }
              }
            }
          }
        ]
      }
    ]
  }
}